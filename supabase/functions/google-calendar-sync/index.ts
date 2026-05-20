import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Refresh Google OAuth token if needed
async function getFreshAccessToken(supabaseAdmin: any, therapistId: string) {
  const { data: integration, error } = await supabaseAdmin
    .from("calendar_integrations")
    .select("*")
    .eq("therapist_id", therapistId)
    .single();

  if (error || !integration) {
    throw new Error("Google Calendar integration not configured for this therapist.");
  }

  if (integration.sync_status === "revoked") {
    throw new Error("revoked");
  }

  const now = new Date();
  const expiresAt = new Date(integration.token_expires_at);

  // If token is still valid (with a 2-minute buffer), return it
  if (expiresAt.getTime() - now.getTime() > 120000) {
    return { accessToken: integration.access_token, calendarId: integration.calendar_id };
  }

  // Token is expired, refresh it
  console.log(`Refreshing access token for therapist: ${therapistId}`);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
      refresh_token: integration.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const tokens = await response.json();
  if (!response.ok) {
    const errText = tokens.error || "";
    const isRevoked = errText === "invalid_grant" || tokens.error_description?.includes("revoked");
    
    await supabaseAdmin
      .from("calendar_integrations")
      .update({ 
        sync_status: isRevoked ? "revoked" : "error", 
        last_sync_error: tokens.error_description || "Google authorization has been revoked. Please reconnect." 
      })
      .eq("therapist_id", therapistId);
    
    throw new Error(isRevoked ? "revoked" : "Failed to refresh Google token: " + (tokens.error_description || tokens.error));
  }

  const { access_token, expires_in } = tokens;
  const tokenExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  // Save the new access token
  await supabaseAdmin
    .from("calendar_integrations")
    .update({
      access_token,
      token_expires_at: tokenExpiresAt,
      sync_status: "active",
      last_sync_error: null
    })
    .eq("therapist_id", therapistId);

  return { accessToken: access_token, calendarId: integration.calendar_id };
}

Deno.serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle Google webhook notifications (push notifications scaffold)
  const googChannelId = req.headers.get("x-goog-channel-id");
  if (googChannelId) {
    console.log(`Received Google Calendar Webhook notification for Channel ID: ${googChannelId}`);
    const googResourceState = req.headers.get("x-goog-resource-state");
    const googChannelToken = req.headers.get("x-goog-channel-token"); // We pass therapist ID as custom token

    if (googResourceState === "sync") {
      console.log("Webhook Channel established successfully.");
      return new Response("OK", { status: 200 });
    }

    const therapistId = googChannelToken;
    if (therapistId) {
      console.log(`Triggering background inbound sync for therapist: ${therapistId}`);
      fetch(`${SUPABASE_URL}/functions/v1/google-calendar-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ action: "inbound-sync", therapistId }),
      }).catch(err => console.error("Webhook triggered sync error:", err));
    }

    return new Response("OK", { status: 200 });
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // 1. Inbound Sync: Google Calendar -> Supabase cache (synced_calendar_events)
    if (action === "inbound-sync") {
      const { therapistId } = body;
      if (!therapistId) {
        return new Response(JSON.stringify({ error: "therapistId is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const syncStart = Date.now();
      console.log(`Starting inbound calendar sync for therapist: ${therapistId}`);
      let accessToken: string;
      let calendarId: string;

      try {
        const credentials = await getFreshAccessToken(supabaseAdmin, therapistId);
        accessToken = credentials.accessToken;
        calendarId = credentials.calendarId || "primary";
      } catch (err) {
        console.error("Credentials error during inbound-sync:", err);
        
        await supabaseAdmin.from("calendar_sync_logs").insert({
          therapist_id: therapistId,
          sync_type: "inbound",
          status: "failure",
          events_synced: 0,
          error_message: err.message,
          sync_duration_ms: Date.now() - syncStart,
        });

        return new Response(JSON.stringify({ error: err.message }), {
          status: err.message === "revoked" ? 401 : 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Check if we have a sync token stored
      const { data: integration } = await supabaseAdmin
        .from("calendar_integrations")
        .select("sync_token")
        .eq("therapist_id", therapistId)
        .single();

      const syncToken = integration?.sync_token;
      let response: Response;
      let data: any;

      if (syncToken) {
        console.log(`Using incremental sync with token: ${syncToken}`);
        const params = new URLSearchParams({ syncToken });
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params.toString()}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        data = await response.json();
      }

      // If no sync token OR response was 410 Gone (expired token)
      if (!syncToken || response.status === 410) {
        if (response && response.status === 410) {
          console.warn("Sync token expired. Performing full resync.");
        }
        
        // Sync window: 7 days ago to 90 days in the future
        const timeMin = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

        const params = new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: "true",
          orderBy: "startTime",
        });

        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params.toString()}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        data = await response.json();

        if (response.ok) {
          // Clear old cache for full refresh
          await supabaseAdmin
            .from("synced_calendar_events")
            .delete()
            .eq("therapist_id", therapistId);
        }
      }

      if (!response.ok) {
        console.error("Google Calendar list events API failed:", data);
        const errMsg = data.error?.message || "Failed to fetch events";
        
        await supabaseAdmin
          .from("calendar_integrations")
          .update({ sync_status: "error", last_sync_error: errMsg })
          .eq("therapist_id", therapistId);

        await supabaseAdmin.from("calendar_sync_logs").insert({
          therapist_id: therapistId,
          sync_type: "inbound",
          status: "failure",
          events_synced: 0,
          error_message: errMsg,
          sync_duration_ms: Date.now() - syncStart,
        });

        return new Response(JSON.stringify({ error: "Google Calendar API error" }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const events = data.items || [];
      const nextSyncToken = data.nextSyncToken;
      console.log(`Fetched ${events.length} event updates from Google Calendar.`);

      let eventsSynced = 0;
      const upsertRows: any[] = [];
      const deleteIds: string[] = [];

      for (const event of events) {
        if (event.status === "cancelled") {
          deleteIds.push(event.id);
        } else {
          const isAllDay = !!event.start.date;
          const start_time = isAllDay ? new Date(event.start.date).toISOString() : event.start.dateTime;
          const end_time = isAllDay ? new Date(event.end.date).toISOString() : event.end.dateTime;

          upsertRows.push({
            therapist_id: therapistId,
            external_event_id: event.id,
            summary: event.summary || "Busy",
            description: event.description || "",
            start_time,
            end_time,
            is_all_day: isAllDay,
            raw_event_data: event,
            updated_at: new Date().toISOString(),
          });
        }
      }

      // Apply DB operations
      if (deleteIds.length > 0) {
        await supabaseAdmin
          .from("synced_calendar_events")
          .delete()
          .eq("therapist_id", therapistId)
          .in("external_event_id", deleteIds);
      }

      if (upsertRows.length > 0) {
        const { error: upsertErr } = await supabaseAdmin
          .from("synced_calendar_events")
          .upsert(upsertRows, { onConflict: "therapist_id,external_event_id" });
        
        if (upsertErr) {
          console.error("Failed to upsert synced events:", upsertErr);
          throw upsertErr;
        }
        eventsSynced = upsertRows.length;
      }

      // Update sync token & integration
      await supabaseAdmin
        .from("calendar_integrations")
        .update({
          sync_status: "active",
          last_sync_at: new Date().toISOString(),
          last_sync_error: null,
          sync_token: nextSyncToken || null,
        })
        .eq("therapist_id", therapistId);

      await supabaseAdmin.from("calendar_sync_logs").insert({
        therapist_id: therapistId,
        sync_type: "inbound",
        status: "success",
        events_synced: eventsSynced,
        sync_duration_ms: Date.now() - syncStart,
      });

      return new Response(JSON.stringify({ success: true, eventsSynced }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 2. Outbound Sync: Booking -> Google Calendar Event
    if (action === "outbound-sync") {
      const { bookingId, eventType } = body;
      if (!bookingId || !eventType) {
        return new Response(JSON.stringify({ error: "bookingId and eventType are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const syncStart = Date.now();

      // Fetch the booking details
      const { data: booking, error: bookingErr } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingErr || !booking) {
        console.error("Failed to fetch booking details:", bookingErr);
        return new Response(JSON.stringify({ error: "Booking not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const therapistId = "afa3ff51-4c49-441b-a49c-e0d8d02240ab"; // Hardcoded Admin/Therapist UUID

      // Fetch integration credentials
      let accessToken: string;
      let calendarId: string;
      try {
        const credentials = await getFreshAccessToken(supabaseAdmin, therapistId);
        accessToken = credentials.accessToken;
        calendarId = credentials.calendarId || "primary";
      } catch (err) {
        // Therapist has no Google Calendar connected - skip (non-fatal)
        console.log(`Skipping outbound sync: Therapist has no Google Calendar connection. (${err.message})`);
        return new Response(JSON.stringify({ success: true, message: "Calendar not integrated" }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Parse times
      const startDateTimeStr = booking.session_datetime;
      if (!startDateTimeStr) {
        throw new Error("Booking does not have a session_datetime set.");
      }
      const startDateTime = new Date(startDateTimeStr);
      let durationMinutes = 50;
      if (booking.service_duration) {
        const match = booking.service_duration.match(/(\d+)\s*min/);
        if (match) durationMinutes = parseInt(match[1], 10);
      }
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

      // Create Meet link conditional flag
      const createConference = booking.session_mode === "video";
      const conferenceParams = createConference ? "?conferenceDataVersion=1" : "";

      const eventPayload = {
        summary: `Therapy Session: ${booking.client_name} (${booking.service_title})`,
        description: `Sanctuary: TherapyConnect Appointment\n---------------------------------\nBooking ID: ${bookingId}\nClient Email: ${booking.client_email}\nClient Phone: ${booking.client_phone || "Not provided"}\nMode: ${booking.session_mode}\nBooking Ref: ${booking.booking_ref}\n\nClient notes: ${booking.reason || "None"}`,
        start: { 
          dateTime: startDateTime.toISOString(),
          timeZone: "Asia/Kolkata",
        },
        end: { 
          dateTime: endDateTime.toISOString(),
          timeZone: "Asia/Kolkata",
        },
        status: booking.status === "cancelled" ? "cancelled" : "confirmed",
        ...(createConference && {
          conferenceData: {
            createRequest: {
              requestId: `meet-${bookingId}-${Date.now()}`,
              conferenceSolutionKey: {
                type: "hangoutsMeet"
              }
            }
          }
        })
      };

      // Handle Event Operations
      if (eventType === "create" || (eventType === "update" && !booking.google_event_id)) {
        // POST to create event
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events${conferenceParams}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventPayload),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          console.error("Google Calendar Create Event failed:", data);
          throw new Error("Google Calendar API failed to create event.");
        }

        // Get Meet URL
        const hangoutLink = data.hangoutLink || null;

        // Store the google_event_id and meet_link in bookings
        await supabaseAdmin
          .from("bookings")
          .update({ 
            google_event_id: data.id,
            meet_link: hangoutLink
          })
          .eq("id", bookingId);

        console.log(`Outbound Event Created: ${data.id}, Meet Link: ${hangoutLink}`);

        await supabaseAdmin.from("calendar_sync_logs").insert({
          therapist_id: therapistId,
          sync_type: "outbound-create",
          status: "success",
          events_synced: 1,
          sync_duration_ms: Date.now() - syncStart,
        });

        // Trigger inbound sync to refresh local blocked caches
        fetch(`${SUPABASE_URL}/functions/v1/google-calendar-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ action: "inbound-sync", therapistId }),
        }).catch(err => console.error("Post-outbound inbound-sync trigger error:", err));

        return new Response(JSON.stringify({ success: true, googleEventId: data.id, meetLink: hangoutLink }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } 
      
      if (eventType === "update" && booking.google_event_id) {
        // PUT to update event
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${booking.google_event_id}${conferenceParams}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventPayload),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          console.error("Google Calendar Update Event failed:", data);
          throw new Error("Google Calendar API failed to update event.");
        }

        const hangoutLink = data.hangoutLink || null;
        
        await supabaseAdmin
          .from("bookings")
          .update({ meet_link: hangoutLink })
          .eq("id", bookingId);

        console.log(`Outbound Event Updated: ${booking.google_event_id}`);

        await supabaseAdmin.from("calendar_sync_logs").insert({
          therapist_id: therapistId,
          sync_type: "outbound-update",
          status: "success",
          events_synced: 1,
          sync_duration_ms: Date.now() - syncStart,
        });

        // Trigger inbound sync
        fetch(`${SUPABASE_URL}/functions/v1/google-calendar-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ action: "inbound-sync", therapistId }),
        }).catch(err => console.error("Post-outbound inbound-sync trigger error:", err));

        return new Response(JSON.stringify({ success: true, meetLink: hangoutLink }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } 
      
      if (eventType === "delete" && booking.google_event_id) {
        // DELETE event from Google
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${booking.google_event_id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok && response.status !== 404 && response.status !== 410) {
          const data = await response.json();
          console.error("Google Calendar Delete Event failed:", data);
          throw new Error("Google Calendar API failed to delete event.");
        }

        // Set google_event_id and meet_link to null
        await supabaseAdmin
          .from("bookings")
          .update({ 
            google_event_id: null,
            meet_link: null
          })
          .eq("id", bookingId);

        console.log(`Outbound Event Deleted: ${booking.google_event_id}`);

        await supabaseAdmin.from("calendar_sync_logs").insert({
          therapist_id: therapistId,
          sync_type: "outbound-delete",
          status: "success",
          events_synced: 1,
          sync_duration_ms: Date.now() - syncStart,
        });

        // Trigger inbound sync
        fetch(`${SUPABASE_URL}/functions/v1/google-calendar-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ action: "inbound-sync", therapistId }),
        }).catch(err => console.error("Post-outbound inbound-sync trigger error:", err));

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Sync Engine error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

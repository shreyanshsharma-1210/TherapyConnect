import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const GOOGLE_CLIENT_ID     = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const redirectUri = `${SUPABASE_URL}/functions/v1/google-calendar-oauth`;

  // 1. Handle OAuth Callback Redirect from Google (GET)
  if (req.method === "GET" && url.searchParams.has("code")) {
    const code = url.searchParams.get("code")!;
    const stateParam = url.searchParams.get("state")!;

    try {
      // Decode state (contains therapistId and origin)
      let stateData: { userId: string; origin: string };
      try {
        const decodedState = atob(stateParam.replace(/-/g, "+").replace(/_/g, "/"));
        stateData = JSON.parse(decodedState);
      } catch (e) {
        console.error("Failed to decode OAuth state:", e);
        return new Response("Invalid state parameter", { status: 400 });
      }

      const { userId, origin } = stateData;

      // Exchange authorization code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error("Token exchange failed:", tokens);
        return Response.redirect(`${origin}/admin/availability?sync_error=token_exchange_failed`);
      }

      const { access_token, refresh_token, expires_in } = tokens;
      const tokenExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Get primary calendar timezone and details
      const calendarResponse = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const calendarData = await calendarResponse.json();
      const timezone = calendarData.timeZone || "Asia/Kolkata";
      
      const calendarMetadata = {
        summary: calendarData.summary || "",
        description: calendarData.description || "",
        etag: calendarData.etag || "",
      };

      // Get verified Google user info (email)
      let googleEmail = "";
      try {
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          googleEmail = userInfo.email || "";
        }
      } catch (err) {
        console.error("Failed to fetch user email:", err);
      }

      // Check if there is an existing integration row to preserve refresh_token if new one is empty
      const { data: existingInt } = await supabaseAdmin
        .from("calendar_integrations")
        .select("refresh_token")
        .eq("therapist_id", userId)
        .eq("provider", "google")
        .maybeSingle();

      const finalRefreshToken = refresh_token || (existingInt ? existingInt.refresh_token : "");

      // Upsert integration
      const { error: upsertError } = await supabaseAdmin
        .from("calendar_integrations")
        .upsert({
          therapist_id: userId,
          provider: "google",
          access_token,
          refresh_token: finalRefreshToken,
          token_expires_at: tokenExpiresAt,
          calendar_id: "primary",
          timezone,
          sync_status: "active",
          last_sync_at: new Date().toISOString(),
          last_sync_error: null,
          google_email: googleEmail,
          calendar_metadata: calendarMetadata,
        }, {
          onConflict: "therapist_id,provider",
        });

      if (upsertError) {
        console.error("Database upsert failed:", upsertError);
        return Response.redirect(`${origin}/admin/availability?sync_error=database_error`);
      }

      // Trigger initial calendar sync asynchronously in the background
      fetch(`${SUPABASE_URL}/functions/v1/google-calendar-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ action: "inbound-sync", therapistId: userId }),
      }).catch(err => console.error("Initial sync trigger error:", err));

      return Response.redirect(`${origin}/admin/availability?sync=success`);
    } catch (err) {
      console.error("OAuth callback error:", err);
      return new Response("Internal Server Error during OAuth callback", { status: 500 });
    }
  }

  // 2. Handle API calls (POST) - Gated by JWT
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify role is admin
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Therapist role required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { action, origin } = body;

    // A. Generate Auth URL
    if (action === "get-auth-url") {
      if (!origin) {
        return new Response(JSON.stringify({ error: "origin is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // Encode state with therapist's user ID and origin
      const stateObj = { userId: user.id, origin };
      const state = btoa(JSON.stringify(stateObj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
        access_type: "offline",
        prompt: "consent",
        state,
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return new Response(JSON.stringify({ authUrl }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // B. Disconnect calendar integration
    if (action === "disconnect") {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Delete integration and synced events
      await supabaseAdmin.from("calendar_integrations").delete().eq("therapist_id", user.id);
      await supabaseAdmin.from("synced_calendar_events").delete().eq("therapist_id", user.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});

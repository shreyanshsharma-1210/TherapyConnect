-- Create Migration for Google Calendar Sync and Advanced Availability

-- 1. Create calendar_integrations table
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'google',
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    sync_token TEXT,
    calendar_id TEXT NOT NULL DEFAULT 'primary',
    timezone TEXT,
    sync_status TEXT NOT NULL DEFAULT 'active',
    last_sync_at TIMESTAMPTZ,
    last_sync_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_therapist_provider UNIQUE (therapist_id, provider)
);

-- 2. Create synced_calendar_events table
CREATE TABLE IF NOT EXISTS public.synced_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    external_event_id TEXT NOT NULL,
    summary TEXT,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    raw_event_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_therapist_external_event UNIQUE (therapist_id, external_event_id)
);

-- 3. Create availability_rules table
CREATE TABLE IF NOT EXISTS public.availability_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_day_time_rule UNIQUE (therapist_id, day_of_week, start_time, end_time)
);

-- 4. Create blocked_time_ranges table
CREATE TABLE IF NOT EXISTS public.blocked_time_ranges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create therapist_vacations table
CREATE TABLE IF NOT EXISTS public.therapist_vacations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create calendar_sync_logs table
CREATE TABLE IF NOT EXISTS public.calendar_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL,
    status TEXT NOT NULL,
    events_synced INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Add buffer settings to therapist_profile
ALTER TABLE public.therapist_profile 
ADD COLUMN IF NOT EXISTS pre_session_buffer_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS post_session_buffer_minutes INTEGER DEFAULT 15;

-- 8. Add google_event_id to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- 9. Add indexes for query performance
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_therapist ON public.calendar_integrations(therapist_id);
CREATE INDEX IF NOT EXISTS idx_synced_events_time ON public.synced_calendar_events(therapist_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_synced_events_ext_id ON public.synced_calendar_events(external_event_id);
CREATE INDEX IF NOT EXISTS idx_avail_rules_day ON public.availability_rules(therapist_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_blocked_ranges_time ON public.blocked_time_ranges(therapist_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_vacations_dates ON public.therapist_vacations(therapist_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_google_event_id ON public.bookings(google_event_id);

-- 10. Enable Row Level Security (RLS) on all new tables
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synced_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_time_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_sync_logs ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS Policies
-- Only therapist (admin) can view/modify their calendar integrations
CREATE POLICY select_own_integration ON public.calendar_integrations
    FOR SELECT USING (auth.uid() = therapist_id);
CREATE POLICY insert_own_integration ON public.calendar_integrations
    FOR INSERT WITH CHECK (auth.uid() = therapist_id);
CREATE POLICY update_own_integration ON public.calendar_integrations
    FOR UPDATE USING (auth.uid() = therapist_id) WITH CHECK (auth.uid() = therapist_id);
CREATE POLICY delete_own_integration ON public.calendar_integrations
    FOR DELETE USING (auth.uid() = therapist_id);

-- Only therapist (admin) can view/modify synced events
CREATE POLICY all_own_synced_events ON public.synced_calendar_events
    USING (auth.uid() = therapist_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Availability rules are readable by everyone, modifiable by admin/therapist
CREATE POLICY select_rules ON public.availability_rules
    FOR SELECT USING (true);
CREATE POLICY write_rules ON public.availability_rules
    USING (auth.uid() = therapist_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Blocked time ranges are readable by everyone, modifiable by admin/therapist
CREATE POLICY select_blocked ON public.blocked_time_ranges
    FOR SELECT USING (true);
CREATE POLICY write_blocked ON public.blocked_time_ranges
    USING (auth.uid() = therapist_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Vacations are readable by everyone, modifiable by admin/therapist
CREATE POLICY select_vacations ON public.therapist_vacations
    FOR SELECT USING (true);
CREATE POLICY write_vacations ON public.therapist_vacations
    USING (auth.uid() = therapist_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Sync logs only accessible by admin/therapist
CREATE POLICY all_sync_logs ON public.calendar_sync_logs
    USING (auth.uid() = therapist_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 12. Add default availability rules for existing therapists (if any profiles exist)
-- Add rule for Mon-Sat 10 AM to 8 PM (with lunch break or standard hours)
-- Note: working hours in Static data are Morning (10-12), Afternoon (2-4), Evening (5-7).
-- Let's define weekday availability: 10:00 to 13:00 (10am-1pm) and 14:00 to 20:00 (2pm-8pm)
INSERT INTO public.availability_rules (therapist_id, day_of_week, start_time, end_time)
SELECT id, day, start_t, end_t
FROM public.profiles,
     (VALUES 
        (1, '10:00:00'::time, '13:00:00'::time), (1, '14:00:00'::time, '20:00:00'::time),
        (2, '10:00:00'::time, '13:00:00'::time), (2, '14:00:00'::time, '20:00:00'::time),
        (3, '10:00:00'::time, '13:00:00'::time), (3, '14:00:00'::time, '20:00:00'::time),
        (4, '10:00:00'::time, '13:00:00'::time), (4, '14:00:00'::time, '20:00:00'::time),
        (5, '10:00:00'::time, '13:00:00'::time), (5, '14:00:00'::time, '20:00:00'::time),
        (6, '10:00:00'::time, '13:00:00'::time), (6, '14:00:00'::time, '20:00:00'::time)
     ) AS rule(day, start_t, end_t)
WHERE role = 'admin'
ON CONFLICT DO NOTHING;

-- 13. Enable Realtime Replication for new tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'calendar_integrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE calendar_integrations;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'blocked_time_ranges'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE blocked_time_ranges;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'therapist_vacations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE therapist_vacations;
  END IF;
END $$;

-- 14. Create Booked Slots RPC helper
CREATE OR REPLACE FUNCTION public.get_therapist_booked_slots(
    therapist_uuid UUID,
    check_date DATE
)
RETURNS TABLE (slot_value TEXT, is_blocked BOOLEAN, block_reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tz TEXT := 'Asia/Kolkata'; -- therapist timezone
    day_start TIMESTAMPTZ;
    day_end TIMESTAMPTZ;
    dow_val INT;
    is_vacation BOOLEAN;
    pre_buffer INTERVAL;
    post_buffer INTERVAL;
BEGIN
    -- Get buffer settings from profiles first
    SELECT 
        COALESCE(pre_session_buffer_minutes, 15) * '1 minute'::INTERVAL,
        COALESCE(post_session_buffer_minutes, 15) * '1 minute'::INTERVAL
    INTO pre_buffer, post_buffer
    FROM public.profiles
    WHERE id = therapist_uuid;

    -- Fallback to therapist_profile if not found or null
    IF pre_buffer IS NULL OR post_buffer IS NULL THEN
        SELECT 
            COALESCE(pre_session_buffer_minutes, 15) * '1 minute'::INTERVAL,
            COALESCE(post_session_buffer_minutes, 15) * '1 minute'::INTERVAL
        INTO pre_buffer, post_buffer
        FROM public.therapist_profile
        WHERE id = '05e992d7-0463-4f1a-b0d1-2a1f3b0a3a2c' OR user_id = therapist_uuid
        LIMIT 1;
    END IF;

    -- Defaults if still null
    IF pre_buffer IS NULL THEN pre_buffer := '15 minutes'::INTERVAL; END IF;
    IF post_buffer IS NULL THEN post_buffer := '15 minutes'::INTERVAL; END IF;

    -- Check if the entire date is in a vacation block
    SELECT EXISTS (
        SELECT 1 FROM public.therapist_vacations
        WHERE therapist_id = therapist_uuid
          AND check_date BETWEEN start_date AND end_date
    ) INTO is_vacation;

    -- Calculate timezone bounds for the day
    day_start := timezone(tz, check_date::timestamp);
    day_end := timezone(tz, (check_date + 1)::timestamp);
    dow_val := EXTRACT(dow FROM check_date);

    -- Define and check each of the 9 slots
    RETURN QUERY
    WITH slots(s_val, s_time, s_dur) AS (
        VALUES 
            ('10:00 AM', '10:00:00'::TIME, '50 minutes'::INTERVAL),
            ('11:00 AM', '11:00:00'::TIME, '50 minutes'::INTERVAL),
            ('12:00 PM', '12:00:00'::TIME, '50 minutes'::INTERVAL),
            ('02:00 PM', '14:00:00'::TIME, '50 minutes'::INTERVAL),
            ('03:00 PM', '15:00:00'::TIME, '50 minutes'::INTERVAL),
            ('04:00 PM', '16:00:00'::TIME, '50 minutes'::INTERVAL),
            ('05:00 PM', '17:00:00'::TIME, '50 minutes'::INTERVAL),
            ('06:00 PM', '18:00:00'::TIME, '50 minutes'::INTERVAL),
            ('07:00 PM', '19:00:00'::TIME, '50 minutes'::INTERVAL)
    ),
    slot_bounds AS (
        SELECT 
            s_val,
            timezone(tz, (check_date + s_time)::timestamp) AS slot_start,
            timezone(tz, (check_date + s_time + s_dur)::timestamp) AS slot_end,
            s_time AS slot_time_only,
            s_time + s_dur AS slot_end_time_only
        FROM slots
    )
    SELECT 
        sb.s_val,
        (
            is_vacation
            OR NOT EXISTS (
                SELECT 1 FROM public.availability_rules ar
                WHERE ar.therapist_id = therapist_uuid
                  AND ar.day_of_week = dow_val
                  AND ar.is_active = true
                  AND sb.slot_time_only >= ar.start_time
                  AND sb.slot_end_time_only <= ar.end_time
            )
            OR EXISTS (
                SELECT 1 FROM public.bookings b
                WHERE b.status IN ('confirmed', 'pending')
                  AND b.deleted_at IS NULL
                  AND b.session_datetime - pre_buffer < sb.slot_end
                  AND b.session_datetime + COALESCE(
                      (substring(b.service_duration from '^[0-9]+')::integer * '1 minute'::INTERVAL),
                      '50 minutes'::INTERVAL
                  ) + post_buffer > sb.slot_start
            )
            OR EXISTS (
                SELECT 1 FROM public.synced_calendar_events sce
                WHERE sce.therapist_id = therapist_uuid
                  AND sce.start_time < sb.slot_end
                  AND sce.end_time > sb.slot_start
            )
            OR EXISTS (
                SELECT 1 FROM public.blocked_time_ranges btr
                WHERE btr.therapist_id = therapist_uuid
                  AND btr.start_time < sb.slot_end
                  AND btr.end_time > sb.slot_start
            )
        ) AS is_blocked,
        (
            CASE 
                WHEN is_vacation THEN 'Therapist is on vacation'
                WHEN NOT EXISTS (
                    SELECT 1 FROM public.availability_rules ar
                    WHERE ar.therapist_id = therapist_uuid
                      AND ar.day_of_week = dow_val
                      AND ar.is_active = true
                      AND sb.slot_time_only >= ar.start_time
                      AND sb.slot_end_time_only <= ar.end_time
                ) THEN 'Outside working hours'
                WHEN EXISTS (
                    SELECT 1 FROM public.bookings b
                    WHERE b.status IN ('confirmed', 'pending')
                      AND b.deleted_at IS NULL
                      AND b.session_datetime - pre_buffer < sb.slot_end
                      AND b.session_datetime + COALESCE(
                          (substring(b.service_duration from '^[0-9]+')::integer * '1 minute'::INTERVAL),
                          '50 minutes'::INTERVAL
                      ) + post_buffer > sb.slot_start
                ) THEN 'Booked slot (or buffer)'
                WHEN EXISTS (
                    SELECT 1 FROM public.synced_calendar_events sce
                    WHERE sce.therapist_id = therapist_uuid
                      AND sce.start_time < sb.slot_end
                      AND sce.end_time > sb.slot_start
                ) THEN 'Blocked by Google Calendar'
                WHEN EXISTS (
                    SELECT 1 FROM public.blocked_time_ranges btr
                    WHERE btr.therapist_id = therapist_uuid
                      AND btr.start_time < sb.slot_end
                      AND btr.end_time > sb.slot_start
                ) THEN 'Blocked manually'
                ELSE NULL
            END
        )::TEXT AS block_reason
    FROM slot_bounds sb;
END;
$$;

-- 15. Create Month Availability RPC helper
CREATE OR REPLACE FUNCTION public.get_month_availability(
    therapist_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (check_date DATE, availability_level TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    curr_date DATE;
    blocked_count INT;
BEGIN
    curr_date := start_date;
    WHILE curr_date <= end_date LOOP
        SELECT COUNT(*) INTO blocked_count
        FROM public.get_therapist_booked_slots(therapist_uuid, curr_date)
        WHERE is_blocked = true;

        IF blocked_count = 9 THEN
            availability_level := 'full';
        ELSIF blocked_count >= 7 THEN
            availability_level := 'limited';
        ELSE
            availability_level := 'available';
        END IF;

        check_date := curr_date;
        RETURN NEXT;
        
        curr_date := curr_date + 1;
    END LOOP;
END;
$$;

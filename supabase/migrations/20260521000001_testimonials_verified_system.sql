-- ============================================================================
-- Migration: Verified Testimonial System & Admin Import
-- ============================================================================
-- Adds support for:
-- 1. User-submitted testimonials (with verified badge for completed sessions)
-- 2. Admin-imported testimonials (legacy testimonials from therapists)
-- 3. Source tracking for testimonials
-- 4. Backend eligibility enforcement

-- Step 1: Add source_type enum
CREATE TYPE testimonial_source_type AS ENUM ('user_submission', 'admin_import', 'legacy');

-- Step 2: Add new columns to testimonials table
ALTER TABLE testimonials
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN is_verified BOOLEAN DEFAULT false,
ADD COLUMN source_type testimonial_source_type DEFAULT 'user_submission',
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Create indexes for efficient queries
CREATE INDEX idx_testimonials_user_id ON testimonials(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_testimonials_is_verified ON testimonials(is_verified) WHERE deleted_at IS NULL;
CREATE INDEX idx_testimonials_source_type ON testimonials(source_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_testimonials_is_approved_verified ON testimonials(is_approved, is_verified) WHERE deleted_at IS NULL;

-- Step 4: Add completed_at column to bookings table for optional auto-completion tracking
ALTER TABLE bookings
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Step 5: Create index for completed bookings
CREATE INDEX idx_bookings_user_completed ON bookings(user_id, status) WHERE status = 'completed' AND deleted_at IS NULL;

-- Step 6: Drop old RPC if exists and create new eligibility check
DROP FUNCTION IF EXISTS check_testimonial_eligibility(UUID);

CREATE OR REPLACE FUNCTION check_testimonial_eligibility(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM bookings
    WHERE user_id = user_uuid
      AND status = 'completed'
      AND deleted_at IS NULL
    LIMIT 1
  );
$$;

-- Step 7: Create function to auto-verify testimonials when user submits
CREATE OR REPLACE FUNCTION auto_verify_user_testimonial()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If this is a user submission with a user_id, check eligibility and auto-verify
  IF NEW.source_type = 'user_submission' AND NEW.user_id IS NOT NULL THEN
    NEW.is_verified := check_testimonial_eligibility(NEW.user_id);
  ELSIF NEW.source_type = 'admin_import' THEN
    -- Admin imports are always verified
    NEW.is_verified := true;
  ELSIF NEW.source_type = 'legacy' THEN
    -- Legacy testimonials are marked as verified by default
    NEW.is_verified := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 8: Create trigger to auto-verify testimonials on insert
DROP TRIGGER IF EXISTS trg_auto_verify_testimonial ON testimonials;
CREATE TRIGGER trg_auto_verify_testimonial
BEFORE INSERT ON testimonials
FOR EACH ROW
EXECUTE FUNCTION auto_verify_user_testimonial();

-- Step 9: Create trigger to update when marked completed
DROP TRIGGER IF EXISTS trg_update_completed_at ON bookings;
CREATE TRIGGER trg_update_completed_at
BEFORE UPDATE ON bookings
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
EXECUTE FUNCTION set_updated_at();

-- Note: set_updated_at() should already exist in your schema

-- Step 10: Update RLS policies for testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view approved testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admin can view all testimonials" ON testimonials;
DROP POLICY IF EXISTS "Users can create their own testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admin can manage testimonials" ON testimonials;

-- Policy: Anyone can read approved, visible testimonials
CREATE POLICY "Users can view approved testimonials"
  ON testimonials FOR SELECT
  USING (
    is_approved = true
    AND is_visible = true
    AND deleted_at IS NULL
  );

-- Policy: Admin can view all testimonials
CREATE POLICY "Admin can view all testimonials"
  ON testimonials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.deleted_at IS NULL
    )
  );

-- Policy: Users can view their own testimonials
CREATE POLICY "Users can view their own testimonials"
  ON testimonials FOR SELECT
  USING (
    user_id = auth.uid()
    AND deleted_at IS NULL
  );

-- Policy: Authenticated users can create testimonials
CREATE POLICY "Authenticated users can create testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND user_id = auth.uid()
  );

-- Policy: Users can update their own testimonials
CREATE POLICY "Users can update their own testimonials"
  ON testimonials FOR UPDATE
  USING (
    user_id = auth.uid()
    AND deleted_at IS NULL
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- Policy: Admin can manage all testimonials
CREATE POLICY "Admin can manage testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
        AND profiles.deleted_at IS NULL
    )
  );

-- Step 11: Backfill existing testimonials
UPDATE testimonials
SET
  source_type = 'legacy',
  is_verified = true,
  is_approved = true
WHERE source_type IS NULL;

COMMIT;

-- EasyRent: Rental Applications (FYP v3 revision, priority 3)
-- Separates application/review from the final booking/lease.
-- Lifecycle: property/unit -> application -> review/approval -> booking/contract -> rent
-- Migration 00026

CREATE TABLE IF NOT EXISTS rental_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES property_units(id) ON DELETE SET NULL,
  applicant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'withdrawn')),
  message text,
  desired_move_in date,
  monthly_rent_offer numeric(12, 0),
  rejection_reason text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rental_applications_property ON rental_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_rental_applications_unit ON rental_applications(unit_id);
CREATE INDEX IF NOT EXISTS idx_rental_applications_applicant ON rental_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_rental_applications_status ON rental_applications(status);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE rental_applications ENABLE ROW LEVEL SECURITY;

-- Applicant / owner / admin can view
CREATE POLICY "rental_apps_select_own"
  ON rental_applications FOR SELECT USING (
    applicant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Tenant submits applications on their own behalf only
CREATE POLICY "rental_apps_tenant_insert"
  ON rental_applications FOR INSERT WITH CHECK (
    applicant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND status = 'pending'
  );

-- Owner/admin review; applicant can withdraw their own pending application
CREATE POLICY "rental_apps_owner_update"
  ON rental_applications FOR UPDATE USING (
    owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "rental_apps_owner_admin_delete"
  ON rental_applications FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    OR applicant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
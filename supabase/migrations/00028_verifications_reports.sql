-- EasyRent: Verification + Reporting (FYP v3 revision, priority 7)
-- Verified indicators only after an authorized verification workflow completes.
-- Migration 00028

CREATE TABLE IF NOT EXISTS property_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  verified_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected', 'suspended')),
  notes text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_verifications_property ON property_verifications(property_id);

CREATE TABLE IF NOT EXISTS owner_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verified_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected', 'suspended')),
  document_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_owner_verifications_owner ON owner_verifications(owner_id);

CREATE TABLE IF NOT EXISTS property_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text NOT NULL
    CHECK (reason IN ('fake_listing', 'wrong_price', 'wrong_location', 'duplicate', 'scam', 'already_rented', 'inappropriate', 'other')),
  details text,
  status text NOT NULL DEFAULT 'reported'
    CHECK (status IN ('reported', 'investigating', 'resolved', 'dismissed')),
  resolution_notes text,
  resolved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_reports_property ON property_reports(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reports_status ON property_reports(status);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE property_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reports ENABLE ROW LEVEL SECURITY;

-- Property verification: owner + verified indicator readable; verified_by admin/super_admin writes
CREATE POLICY "prop_verification_select"
  ON property_verifications FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties p WHERE p.id = property_verifications.property_id AND p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "prop_verification_write"
  ON property_verifications FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Owner verification: owner sees own, admins manage
CREATE POLICY "owner_verification_select"
  ON owner_verifications FOR SELECT USING (
    owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "owner_verification_write"
  ON owner_verifications FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Reports: anyone signed in can report; owner/admin can view; admin manages workflow
CREATE POLICY "property_reports_insert"
  ON property_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "property_reports_select"
  ON property_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties p WHERE p.id = property_reports.property_id AND p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "property_reports_admin_update"
  ON property_reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
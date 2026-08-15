-- EasyRent: Lease Renewals, Notification Prefs, Documents, Saved Searches
-- (FYP v3 revision, priorities 10)
-- Migration 00031

CREATE TABLE IF NOT EXISTS lease_renewals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'offered'
    CHECK (status IN ('offered', 'accepted', 'rejected', 'renewed', 'expired')),
  new_end_date date,
  new_monthly_rent numeric(12, 0),
  offered_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lease_renewals_contract ON lease_renewals(contract_id);
CREATE INDEX IF NOT EXISTS idx_lease_renewals_tenant ON lease_renewals(tenant_id);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'in_app'
    CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
  category text NOT NULL DEFAULT 'general'
    CHECK (category IN ('booking', 'payment', 'maintenance', 'messaging', 'contract', 'security', 'marketing', 'general')),
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, channel, category)
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type text NOT NULL
    CHECK (entity_type IN ('contract', 'property', 'unit', 'verification', 'receipt', 'maintenance', 'other')),
  entity_id uuid,
  file_path text NOT NULL,
  file_name text,
  mime_type text,
  size integer,
  storage_bucket text NOT NULL DEFAULT 'private',
  is_public boolean DEFAULT false,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  notification_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE lease_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Lease renewals: tenant + owner + admin
CREATE POLICY "lease_renewals_select"
  ON lease_renewals FOR SELECT USING (
    tenant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "lease_renewals_insert"
  ON lease_renewals FOR INSERT WITH CHECK (
    owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "lease_renewals_participant_update"
  ON lease_renewals FOR UPDATE USING (
    tenant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Notification preferences: user owns theirs
CREATE POLICY "notif_prefs_self"
  ON notification_preferences FOR SELECT USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "notif_prefs_self_insert"
  ON notification_preferences FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "notif_prefs_self_update"
  ON notification_preferences FOR UPDATE USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Documents: owner/admins manage; private docs are never public
CREATE POLICY "documents_select"
  ON documents FOR SELECT USING (
    owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR (is_public = true)
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "documents_owner_insert"
  ON documents FOR INSERT WITH CHECK (
    owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "documents_owner_update"
  ON documents FOR UPDATE USING (
    owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "documents_owner_delete"
  ON documents FOR DELETE USING (
    owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Saved searches: user-owned
CREATE POLICY "saved_searches_self"
  ON saved_searches FOR SELECT USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "saved_searches_self_insert"
  ON saved_searches FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "saved_searches_self_update"
  ON saved_searches FOR UPDATE USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "saved_searches_self_delete"
  ON saved_searches FOR DELETE USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
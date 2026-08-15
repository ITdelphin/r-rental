-- EasyRent: Privacy, Security & Session Logging (FYP v3 revision, priority 9)
-- consent_records + data_requests: user data-protection rights.
-- security_events + user_sessions: privileged-operation audit.
-- Migration 00030

CREATE TABLE IF NOT EXISTS consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  purpose text NOT NULL,
  channel text NOT NULL DEFAULT 'in_app'
    CHECK (channel IN ('in_app', 'email', 'sms', 'push', 'web')),
  granted boolean DEFAULT true,
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_user ON consent_records(user_id);

CREATE TABLE IF NOT EXISTS data_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_type text NOT NULL
    CHECK (request_type IN ('access', 'correction', 'export', 'deletion', 'consent_withdrawal')),
  details text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'fulfilled', 'rejected', 'cancelled')),
  fulfilled_at timestamptz,
  handled_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_requests_user ON data_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON data_requests(status);

CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL
    CHECK (event_type IN ('login', 'logout', 'failed_login', 'role_change', 'permission_change',
      'config_change', 'password_reset', 'account_suspend', 'data_access', 'data_export',
      'data_deletion', 'verification', 'payment_state_change', 'mfa_event')),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  success boolean DEFAULT true,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token text,
  ip_address text,
  user_agent text,
  started_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_revoked boolean DEFAULT false,
  revoked_at timestamptz,
  revoked_reason text
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Consent: user reads/writes own; admins read for audit
CREATE POLICY "consent_self_select"
  ON consent_records FOR SELECT USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "consent_self_insert"
  ON consent_records FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "consent_self_update"
  ON consent_records FOR UPDATE USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Data requests: user owns; admin handles
CREATE POLICY "data_requests_self_select"
  ON data_requests FOR SELECT USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "data_requests_self_insert"
  ON data_requests FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "data_requests_admin_update"
  ON data_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Security events: admins read, service_role writes
CREATE POLICY "security_events_admin_select"
  ON security_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "security_events_service_insert"
  ON security_events FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Sessions: user reads/revokes own, admins read all
CREATE POLICY "user_sessions_self_select"
  ON user_sessions FOR SELECT USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "user_sessions_self_update"
  ON user_sessions FOR UPDATE USING (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- EasyRent: Maintenance Workflow (FYP v3 revision, priority 8)
-- Workflow: submitted -> acknowledged -> assigned -> in_progress -> completed -> verified -> closed
-- Migration 00029

CREATE TABLE IF NOT EXISTS maintenance_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  url text NOT NULL,
  file_name text,
  mime_type text,
  size integer,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  assignee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'started', 'completed')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maint_comments_request ON maintenance_comments(request_id);
CREATE INDEX IF NOT EXISTS idx_maint_attachments_request ON maintenance_attachments(request_id);
CREATE INDEX IF NOT EXISTS idx_maint_assignments_request ON maintenance_assignments(request_id);
CREATE INDEX IF NOT EXISTS idx_maint_assignments_assignee ON maintenance_assignments(assignee_id);

-- ============================================================
-- RLS (participants: tenant + property owner + admins)
-- ============================================================
ALTER TABLE maintenance_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maint_comments_participant_select"
  ON maintenance_comments FOR SELECT USING (EXISTS (
    SELECT 1 FROM maintenance_requests mr
    JOIN properties p ON p.id = mr.property_id
    WHERE mr.id = maintenance_comments.request_id
      AND (mr.tenant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  ));

CREATE POLICY "maint_comments_insert"
  ON maintenance_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "maint_attachments_select"
  ON maintenance_attachments FOR SELECT USING (EXISTS (
    SELECT 1 FROM maintenance_requests mr
    JOIN properties p ON p.id = mr.property_id
    WHERE mr.id = maintenance_attachments.request_id
      AND (mr.tenant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  ));

CREATE POLICY "maint_attachments_insert"
  ON maintenance_attachments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "maint_assignments_select"
  ON maintenance_assignments FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "maint_assignments_admin_insert"
  ON maintenance_assignments FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM maintenance_requests mr
    JOIN properties p ON p.id = mr.property_id
    WHERE mr.id = maintenance_assignments.request_id
      AND (p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  ));

CREATE POLICY "maint_assignments_admin_update"
  ON maintenance_assignments FOR UPDATE USING (auth.role() = 'authenticated');
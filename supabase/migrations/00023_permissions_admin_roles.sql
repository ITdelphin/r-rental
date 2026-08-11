-- EasyRent: Granular Permissions & Admin Management System
-- Migration 00023: Create permissions, admin_roles, role_templates, config_history tables
-- This is an additive migration - does not modify existing tables

-- ============================================================
-- 1. PERMISSIONS TABLE
-- Stores all granular permissions available in the system
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  category text NOT NULL,
  label text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. ROLE TEMPLATES TABLE
-- Predefined permission templates for admin roles
-- ============================================================
CREATE TABLE IF NOT EXISTS role_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. ADMIN ROLES TABLE
-- Custom roles assigned to admin users
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_name text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  template_id uuid REFERENCES role_templates(id) ON DELETE SET NULL,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, role_name)
);

-- ============================================================
-- 4. CONFIG HISTORY TABLE
-- Tracks all configuration changes for audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS config_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  setting_key text NOT NULL,
  old_value text,
  new_value text,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. FEATURE FLAGS TABLE
-- Platform feature toggles managed by Super Admin
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  is_enabled boolean DEFAULT true,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 6. ADMIN INVITATIONS TABLE
-- Pending admin invitations
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role_name text NOT NULL DEFAULT 'admin',
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  invited_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz
);

-- ============================================================
-- 7. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_admin_roles_profile_id ON admin_roles(profile_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_is_active ON admin_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_config_history_actor_id ON config_history(actor_id);
CREATE INDEX IF NOT EXISTS idx_config_history_setting_key ON config_history(setting_key);
CREATE INDEX IF NOT EXISTS idx_config_history_created_at ON config_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_email ON admin_invitations(email);
CREATE INDEX IF NOT EXISTS idx_admin_invitations_token ON admin_invitations(token);

-- ============================================================
-- 8. RLS POLICIES
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invitations ENABLE ROW LEVEL SECURITY;

-- PERMISSIONS: Everyone can read, only super_admin can modify
CREATE POLICY "permissions_select_all" ON permissions FOR SELECT USING (true);
CREATE POLICY "permissions_super_admin_insert" ON permissions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "permissions_super_admin_update" ON permissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "permissions_super_admin_delete" ON permissions FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- ROLE TEMPLATES: Everyone can read system templates, super_admin can manage
CREATE POLICY "role_templates_select_all" ON role_templates FOR SELECT USING (true);
CREATE POLICY "role_templates_super_admin_insert" ON role_templates FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "role_templates_super_admin_update" ON role_templates FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "role_templates_super_admin_delete" ON role_templates FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- ADMIN ROLES: super_admin can manage all, admin can view own
CREATE POLICY "admin_roles_select_own" ON admin_roles FOR SELECT USING (
  profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "admin_roles_super_admin_insert" ON admin_roles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "admin_roles_super_admin_update" ON admin_roles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "admin_roles_super_admin_delete" ON admin_roles FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- CONFIG HISTORY: super_admin can read all, admin can read limited
CREATE POLICY "config_history_select_admin" ON config_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "config_history_insert_authenticated" ON config_history FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- FEATURE FLAGS: Everyone can read, super_admin can manage
CREATE POLICY "feature_flags_select_all" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "feature_flags_super_admin_insert" ON feature_flags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "feature_flags_super_admin_update" ON feature_flags FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "feature_flags_super_admin_delete" ON feature_flags FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- ADMIN INVITATIONS: super_admin can manage all
CREATE POLICY "admin_invitations_select_super_admin" ON admin_invitations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "admin_invitations_super_admin_insert" ON admin_invitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "admin_invitations_super_admin_update" ON admin_invitations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
);

-- ============================================================
-- 9. SEED DEFAULT PERMISSIONS
-- ============================================================
INSERT INTO permissions (key, category, label, description) VALUES
-- Users
('users.view', 'users', 'View Users', 'View user profiles and details'),
('users.create', 'users', 'Create Users', 'Create new user accounts'),
('users.edit', 'users', 'Edit Users', 'Edit user profiles'),
('users.suspend', 'users', 'Suspend Users', 'Suspend user accounts'),
('users.delete', 'users', 'Delete Users', 'Delete user accounts'),
('users.verify', 'users', 'Verify Users', 'Verify user accounts'),

-- Properties
('properties.view', 'properties', 'View Properties', 'View property listings'),
('properties.create', 'properties', 'Create Properties', 'Create new property listings'),
('properties.edit', 'properties', 'Edit Properties', 'Edit property listings'),
('properties.verify', 'properties', 'Verify Properties', 'Approve property listings'),
('properties.reject', 'properties', 'Reject Properties', 'Reject property listings'),
('properties.delete', 'properties', 'Delete Properties', 'Delete property listings'),
('properties.feature', 'properties', 'Feature Properties', 'Feature property listings'),

-- Bookings
('bookings.view', 'bookings', 'View Bookings', 'View booking records'),
('bookings.edit', 'bookings', 'Edit Bookings', 'Edit booking records'),
('bookings.approve', 'bookings', 'Approve Bookings', 'Approve booking requests'),
('bookings.reject', 'bookings', 'Reject Bookings', 'Reject booking requests'),
('bookings.cancel', 'bookings', 'Cancel Bookings', 'Cancel bookings'),

-- Payments
('payments.view', 'payments', 'View Payments', 'View payment records'),
('payments.manage', 'payments', 'Manage Payments', 'Manage payment records'),
('payments.refund', 'payments', 'Refund Payments', 'Process payment refunds'),

-- Complaints
('complaints.view', 'complaints', 'View Complaints', 'View complaint records'),
('complaints.manage', 'complaints', 'Manage Complaints', 'Manage complaint records'),
('complaints.resolve', 'complaints', 'Resolve Complaints', 'Resolve complaints'),

-- Reports
('reports.view', 'reports', 'View Reports', 'View platform reports'),
('reports.export', 'reports', 'Export Reports', 'Export report data'),

-- CMS
('cms.view', 'cms', 'View CMS', 'View CMS pages'),
('cms.edit', 'cms', 'Edit CMS', 'Edit CMS pages'),
('cms.publish', 'cms', 'Publish CMS', 'Publish CMS pages'),

-- Notifications
('notifications.view', 'notifications', 'View Notifications', 'View notification settings'),
('notifications.manage', 'notifications', 'Manage Notifications', 'Manage notification settings'),

-- Settings
('settings.view', 'settings', 'View Settings', 'View platform settings'),
('settings.manage', 'settings', 'Manage Settings', 'Manage platform settings'),

-- Audit & Security
('audit_logs.view', 'audit', 'View Audit Logs', 'View audit log records'),
('security.manage', 'security', 'Manage Security', 'Manage security settings'),

-- Admin Management
('admin.manage', 'admin', 'Manage Admins', 'Manage administrator accounts'),
('admin.permissions', 'admin', 'Manage Permissions', 'Manage admin permissions'),

-- System
('system.manage', 'system', 'Manage System', 'Manage system configuration')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 10. SEED DEFAULT ROLE TEMPLATES
-- ============================================================
INSERT INTO role_templates (name, description, permissions, is_system) VALUES
(
  'Platform Administrator',
  'Broad operational access but NO system ownership',
  '["users.view","users.edit","users.suspend","users.verify","properties.view","properties.edit","properties.verify","properties.reject","bookings.view","bookings.edit","bookings.approve","bookings.reject","payments.view","payments.manage","complaints.view","complaints.manage","complaints.resolve","reports.view","reports.export","cms.view","cms.edit","cms.publish","notifications.view","notifications.manage","settings.view"]'::jsonb,
  true
),
(
  'Property Administrator',
  'Properties + owners + verification',
  '["users.view","properties.view","properties.edit","properties.verify","properties.reject","properties.feature","properties.delete","bookings.view","reports.view"]'::jsonb,
  true
),
(
  'Booking Administrator',
  'Bookings + tenants + booking reports',
  '["users.view","bookings.view","bookings.edit","bookings.approve","bookings.reject","bookings.cancel","reports.view","reports.export"]'::jsonb,
  true
),
(
  'Finance Administrator',
  'Payments + financial reports',
  '["payments.view","payments.manage","payments.refund","bookings.view","reports.view","reports.export"]'::jsonb,
  true
),
(
  'Support Administrator',
  'Users + complaints + messages',
  '["users.view","users.edit","complaints.view","complaints.manage","complaints.resolve","notifications.view","notifications.manage","reports.view"]'::jsonb,
  true
),
(
  'Content Administrator',
  'CMS + FAQs + announcements',
  '["cms.view","cms.edit","cms.publish","notifications.view","notifications.manage","reports.view"]'::jsonb,
  true
)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 11. SEED DEFAULT FEATURE FLAGS
-- ============================================================
INSERT INTO feature_flags (key, label, description, is_enabled) VALUES
('registration_enabled', 'Registration', 'Allow new user registrations', true),
('booking_enabled', 'Bookings', 'Allow property bookings', true),
('messaging_enabled', 'Messaging', 'Allow user messaging', true),
('review_enabled', 'Reviews', 'Allow property reviews', true),
('maintenance_enabled', 'Maintenance Requests', 'Allow maintenance requests', true),
('notification_enabled', 'Notifications', 'Enable in-app notifications', true),
('newsletter_enabled', 'Newsletter', 'Allow newsletter subscriptions', true),
('property_submission_enabled', 'Property Submission', 'Allow owners to submit properties', true)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 12. HELPER FUNCTION: Check if user has specific permission
-- ============================================================
CREATE OR REPLACE FUNCTION has_permission(permission_key text)
RETURNS boolean AS $$
DECLARE
  user_role text;
  user_permissions jsonb;
BEGIN
  -- Get user role
  SELECT role INTO user_role
  FROM profiles
  WHERE user_id = auth.uid();

  -- Super admin has all permissions
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;

  -- Check admin role permissions
  SELECT permissions INTO user_permissions
  FROM admin_roles
  WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF user_permissions IS NOT NULL THEN
    RETURN user_permissions ? permission_key;
  END IF;

  -- Default admin permissions (if no specific role assigned)
  IF user_role = 'admin' THEN
    -- Admins get basic permissions by default
    RETURN permission_key IN (
      'users.view', 'properties.view', 'bookings.view',
      'complaints.view', 'reports.view'
    );
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- 13. HELPER FUNCTION: Get user permissions array
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_permissions()
RETURNS jsonb AS $$
DECLARE
  user_role text;
  user_permissions jsonb;
  result jsonb;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE user_id = auth.uid();

  IF user_role = 'super_admin' THEN
    SELECT jsonb_agg(key) INTO result FROM permissions;
    RETURN COALESCE(result, '[]'::jsonb);
  END IF;

  SELECT permissions INTO user_permissions
  FROM admin_roles
  WHERE profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  IF user_permissions IS NOT NULL THEN
    RETURN user_permissions;
  END IF;

  IF user_role = 'admin' THEN
    RETURN '["users.view","properties.view","bookings.view","complaints.view","reports.view"]'::jsonb;
  END IF;

  RETURN '[]'::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

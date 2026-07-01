-- Enable RLS on settings (already enabled, but ensure it is)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read settings (for public pages & dashboard)
DROP POLICY IF EXISTS "authenticated_can_read_settings" ON settings;
CREATE POLICY "authenticated_can_read_settings" ON settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow super_admin to insert/update settings
DROP POLICY IF EXISTS "super_admin_can_insert_settings" ON settings;
CREATE POLICY "super_admin_can_insert_settings" ON settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

DROP POLICY IF EXISTS "super_admin_can_update_settings" ON settings;
CREATE POLICY "super_admin_can_update_settings" ON settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

DROP POLICY IF EXISTS "super_admin_can_delete_settings" ON settings;
CREATE POLICY "super_admin_can_delete_settings" ON settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

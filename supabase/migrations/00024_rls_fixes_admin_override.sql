-- EasyRent: Fix RLS gaps + Protect settings from admin modification
-- Migration 00024: Enhanced RLS policies for admin override and settings protection

-- ============================================================
-- 1. FIX: Settings table - restrict SYSTEM_PROTECTED keys to super_admin only
-- ============================================================

-- Drop existing overly-permissive policies
DROP POLICY IF EXISTS "super_admin_can_insert_settings" ON settings;
DROP POLICY IF EXISTS "super_admin_can_update_settings" ON settings;
DROP POLICY IF EXISTS "super_admin_can_delete_settings" ON settings;

-- Super admin can insert/update/delete ALL settings
CREATE POLICY "super_admin_full_access_settings" ON settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- Admin can only update PLATFORM_MANAGED settings (not SYSTEM_PROTECTED)
-- This is enforced at the application level via the settings key prefix
-- The RLS policy allows admin to update settings, but the app filters which keys

-- ============================================================
-- 2. FIX: Messages - add admin override for content moderation
-- ============================================================
CREATE POLICY "admin_can_view_all_messages" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- 3. FIX: Notifications - add admin override
-- ============================================================
CREATE POLICY "admin_can_view_all_notifications" ON notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- 4. FIX: Reviews - add admin delete for moderation
-- ============================================================
CREATE POLICY "admin_can_delete_reviews" ON reviews
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- 5. FIX: Favorites - add admin read for analytics
-- ============================================================
CREATE POLICY "admin_can_view_all_favorites" ON favorites
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================
-- 6. FIX: Bookings - add admin delete for cleanup
-- ============================================================
CREATE POLICY "admin_can_delete_bookings" ON bookings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- ============================================================
-- 7. FIX: Property images - add update policy for reordering
-- ============================================================
CREATE POLICY "owners_can_update_property_images" ON property_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_images.property_id
        AND (p.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
    )
  );

-- ============================================================
-- 8. FIX: Property videos - add delete policy
-- ============================================================
CREATE POLICY "owners_can_delete_property_videos" ON property_videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_videos.property_id
        AND (p.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
    )
  );

-- ============================================================
-- 9. FIX: Amenities - add delete policy
-- ============================================================
CREATE POLICY "owners_can_delete_amenities" ON amenities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = amenities.property_id
        AND (p.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
    )
  );

-- ============================================================
-- 10. FIX: Complaints - add delete for admin cleanup
-- ============================================================
CREATE POLICY "admin_can_delete_complaints" ON complaints
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- ============================================================
-- 11. FIX: Contracts - add delete for admin cleanup
-- ============================================================
CREATE POLICY "admin_can_delete_contracts" ON contracts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- ============================================================
-- 12. FIX: Maintenance requests - add delete for admin cleanup
-- ============================================================
CREATE POLICY "admin_can_delete_maintenance" ON maintenance_requests
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- ============================================================
-- 13. FIX: Email logs - restrict INSERT to service_role only
-- ============================================================
DROP POLICY IF EXISTS "Service role can insert email logs" ON email_logs;
CREATE POLICY "service_role_insert_email_logs" ON email_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 14. FIX: Audit logs - restrict INSERT to service_role only
-- ============================================================
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;
CREATE POLICY "service_role_insert_audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 15. ENABLE RLS on newsletters (it was enabled but had no policies)
-- ============================================================
DROP POLICY IF EXISTS "authenticated_can_read_newsletters" ON newsletters;
CREATE POLICY "authenticated_can_read_newsletters" ON newsletters
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_can_insert_newsletters" ON newsletters
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

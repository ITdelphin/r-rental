-- Allow anonymous (unauthenticated) users to read settings
-- Needed for logo, platform_name, and other branding settings on public pages
drop policy if exists "public_can_read_settings" on settings;
create policy "public_can_read_settings"
  on settings for select
  to anon
  using (true);

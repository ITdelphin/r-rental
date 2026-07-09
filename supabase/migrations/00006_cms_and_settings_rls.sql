-- RLS policies for cms_pages (table has RLS enabled but no policies → all denied)
create policy "CMS pages are viewable by everyone"
  on cms_pages for select using (true);

create policy "Super admins can insert CMS pages"
  on cms_pages for insert
  with check (exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin'));

create policy "Super admins can update CMS pages"
  on cms_pages for update
  using (exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin'));

create policy "Super admins can delete CMS pages"
  on cms_pages for delete
  using (exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin'));

-- Storage bucket for CMS media (logo, favicon, hero images, hero video)
insert into storage.buckets (id, name, public) values ('cms', 'cms', true)
  on conflict (id) do nothing;

create policy "Authenticated users can upload CMS media"
  on storage.objects for insert
  with check (bucket_id = 'cms' and auth.role() = 'authenticated');

create policy "Public can view CMS media"
  on storage.objects for select
  using (bucket_id = 'cms');

create policy "Authenticated users can delete CMS media"
  on storage.objects for delete
  using (bucket_id = 'cms' and auth.role() = 'authenticated');

-- Settings RLS policies (safety net for 00003_settings_rls.sql if not yet applied)
drop policy if exists "authenticated_can_read_settings" on settings;
create policy "authenticated_can_read_settings"
  on settings for select to authenticated using (true);

drop policy if exists "super_admin_can_insert_settings" on settings;
create policy "super_admin_can_insert_settings"
  on settings for insert to authenticated
  with check (exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin'));

drop policy if exists "super_admin_can_update_settings" on settings;
create policy "super_admin_can_update_settings"
  on settings for update to authenticated
  using (exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin'))
  with check (exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin'));

drop policy if exists "super_admin_can_delete_settings" on settings;
create policy "super_admin_can_delete_settings"
  on settings for delete to authenticated
  using (exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin'));

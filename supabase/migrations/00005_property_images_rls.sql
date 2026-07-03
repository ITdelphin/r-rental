-- RLS policies for property_images (missing from initial schema)
create policy "Property images are viewable by everyone"
  on property_images for select using (true);
create policy "Owners can insert property images"
  on property_images for insert with check (
    exists (select 1 from properties where id = property_id and owner_id = auth.uid())
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );
create policy "Owners can delete own property images"
  on property_images for delete using (
    exists (select 1 from properties where id = property_id and owner_id = auth.uid())
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- RLS policies for property_videos (missing)
create policy "Property videos are viewable by everyone"
  on property_videos for select using (true);
create policy "Owners can insert property videos"
  on property_videos for insert with check (
    exists (select 1 from properties where id = property_id and owner_id = auth.uid())
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- RLS policies for amenities (missing)
create policy "Amenities are viewable by everyone"
  on amenities for select using (true);
create policy "Owners can insert amenities"
  on amenities for insert with check (
    exists (select 1 from properties where id = property_id and owner_id = auth.uid())
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- Storage bucket RLS for property-images bucket
insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true)
  on conflict (id) do nothing;

create policy "Authenticated users can upload property images"
  on storage.objects for insert
  with check (
    bucket_id = 'property-images'
    and auth.role() = 'authenticated'
  );

create policy "Public can view property images"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "Owners can delete own property images"
  on storage.objects for delete
  using (
    bucket_id = 'property-images'
    and auth.uid() = (select (string_to_array(name, '/'))[1]::uuid)
  );

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

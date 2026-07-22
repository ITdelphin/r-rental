-- Create avatars storage bucket (missing -- avatar uploads were silently failing)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

-- Allow authenticated users to upload avatars
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Allow public viewing of avatars
create policy "Public can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Allow users to update their own avatars
create policy "Users can update own avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid() = (select (string_to_array(name, '/'))[2]::uuid));

-- Allow users to delete their own avatars
create policy "Users can delete own avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid() = (select (string_to_array(name, '/'))[2]::uuid));

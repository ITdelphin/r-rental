-- Fix avatar storage RLS policies to match the upload path format: u/{user_id}/{timestamp}.{ext}
-- The path components split by '/' are: [1]=u, [2]=user_id, [3]=filename

-- Drop outdated policies that reference wrong path positions
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Public can view avatars" on storage.objects;
drop policy if exists "Users can update own avatars" on storage.objects;
drop policy if exists "Users can delete own avatars" on storage.objects;

-- Allow any authenticated user to upload into their own subfolder: u/{their_user_id}/...
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (string_to_array(name, '/'))[2]::uuid = auth.uid()
  );

-- Allow public viewing of avatars
create policy "Public can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Allow users to update their own avatars
create policy "Users can update own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() = (string_to_array(name, '/'))[2]::uuid
  );

-- Allow users to delete their own avatars
create policy "Users can delete own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() = (string_to_array(name, '/'))[2]::uuid
  );

-- Add missing RLS policies for messages DELETE and profiles DELETE

-- Messages: users can delete their own messages
drop policy if exists "Users can delete own messages" on messages;
create policy "Users can delete own messages"
  on messages for delete
  using (sender_id = auth.uid() or receiver_id = auth.uid());

-- Profiles: users can delete their own profile (account deletion)
drop policy if exists "Users can delete own profile" on profiles;
create policy "Users can delete own profile"
  on profiles for delete
  using (user_id = auth.uid());

-- Profiles: admins can delete any profile
drop policy if exists "Admins can delete profiles" on profiles;
create policy "Admins can delete profiles"
  on profiles for delete
  using (exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin')));

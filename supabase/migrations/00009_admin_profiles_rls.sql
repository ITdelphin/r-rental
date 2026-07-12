-- Allow admins and super_admins to update any profile (role management, suspend, verify)
drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role in ('admin', 'super_admin')
    )
  )
  with check (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role in ('admin', 'super_admin')
    )
  );

-- Allow admins and super_admins to delete profiles
drop policy if exists "Admins can delete profiles" on profiles;
create policy "Admins can delete profiles"
  on profiles for delete
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role in ('admin', 'super_admin')
    )
  );

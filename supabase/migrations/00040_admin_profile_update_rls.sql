-- Allow admins & super_admins to update any profile (role, suspend, verify).
-- The remote DB was missing the admin-override UPDATE policy, so role changes
-- silently no-op'd (PostgREST returns success with 0 rows updated under RLS).

alter table profiles enable row level security;

-- Users can update their OWN profile (role changes are still guarded by the
-- protect_profile_role trigger, which blocks self-role-change).
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins and super_admins can update ANY profile (role, suspend, verify, etc.)
drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
    )
  );
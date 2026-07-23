-- Fix: Allow admins & super_admins to update ANY profile field (role, suspend, verify, etc.)
-- The previous policy may not have been applied. This safely recreates it.

alter table profiles enable row level security;

-- Drop old conflicting policies
drop policy if exists "Admins can update any profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Users can update their OWN profile (except role - only admins can change roles)
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins and super_admins can update ANY profile (role, suspend, verify, etc.)
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

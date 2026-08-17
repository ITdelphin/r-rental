-- EasyRent: Super-Admin hardening (FYP)
-- 1) RLS: only a super_admin may UPDATE/delete super_admin profiles; an admin may
--    only update profiles whose current role is NOT super_admin. Admin-role management
--    is enforced by the trigger below (clear error instead of silent no-op).
-- 2) protect_profile_role: managing admin/super_admin roles is super_admin-only,
--    admins may only manage tenant/owner/agent roles.

-- ---------- 1. Role-aware UPDATE policy ----------
drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid() and p.role = 'super_admin'
    )
    or (
      exists (
        select 1 from profiles p
        where p.user_id = auth.uid() and p.role = 'admin'
      )
      and role <> 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid() and p.role = 'super_admin'
    )
    or (
      exists (
        select 1 from profiles p
        where p.user_id = auth.uid() and p.role = 'admin'
      )
      and role <> 'super_admin'
    )
  );

-- Only super_admin may delete profiles through the client (client-side delete is
-- otherwise performed by the delete-user edge function with the service role).
drop policy if exists "Only super admin can delete profiles" on profiles;
drop policy if exists "Admins can delete profiles" on profiles;
create policy "Only super admin can delete profiles"
  on profiles for delete
  to authenticated
  using (
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid() and p.role = 'super_admin'
    )
  );

-- ---------- 2. Trigger: super_admin manages admin roles ----------
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  actor_role text;
begin
  if NEW.role is distinct from OLD.role then
    if auth.uid() is null then
      raise exception 'Role changes require a signed-in admin';
    end if;

    select role into actor_role
    from profiles
    where user_id = auth.uid();

    -- Nobody may change their own role (prevents self-escalation / lockout bypass).
    if auth.uid() = NEW.user_id then
      raise exception 'You cannot change your own role';
    end if;

    if actor_role not in ('admin', 'super_admin') then
      raise exception 'Only an admin may change roles';
    end if;

    -- Managing admin or super_admin roles is super_admin-only.
    if NEW.role in ('admin', 'super_admin') or OLD.role in ('admin', 'super_admin') then
      if actor_role <> 'super_admin' then
        raise exception 'Only a super admin may manage admin roles';
      end if;
    end if;
  end if;

  return new;
end;
$$;
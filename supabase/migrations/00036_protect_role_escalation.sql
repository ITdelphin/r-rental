-- EasyRent: Harden role-change trigger — prevent admin → super_admin escalation
-- Migration 00036
--
-- The previous protect_profile_role trigger only checked that the actor was an
-- admin or super_admin. That let a plain 'admin' assign the 'super_admin' role
-- to anyone (including themselves) by calling the API directly, bypassing the
-- UI guard. This migration closes that hole:
--   1. Only a super_admin may grant or revoke the 'super_admin' role.
--   2. No user may change their own role.
--   3. Admins keep the ability to manage tenant/owner/agent roles.

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

    -- Assigning or removing the super_admin role is super_admin-only.
    if NEW.role = 'super_admin' or OLD.role = 'super_admin' then
      if actor_role <> 'super_admin' then
        raise exception 'Only a super admin may manage super admin roles';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on profiles;
create trigger trg_protect_profile_role
  before update of role on profiles
  for each row execute function public.protect_profile_role();

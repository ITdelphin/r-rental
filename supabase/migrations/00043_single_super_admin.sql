-- EasyRent: enforce exactly one super_admin on the platform.
-- 1) Partial unique index: at most one row may have role = 'super_admin'.
-- 2) Friendly error (instead of a raw unique-violation) when a second one is attempted.
--    Combined with 00042 (only a super_admin may manage admin/super_admin roles and
--    nobody may change their own role), the super_admin role is effectively permanent.

drop index if exists uq_profiles_single_super_admin;
create unique index uq_profiles_single_super_admin
  on profiles (role) where role = 'super_admin';

create or replace function public.prevent_second_super_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if NEW.role = 'super_admin'
     and exists (
       select 1 from profiles
       where role = 'super_admin' and user_id <> NEW.user_id
     )
  then
    raise exception 'Only one super admin is allowed on the platform';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_second_super_admin on profiles;
create trigger trg_prevent_second_super_admin
  before insert or update of role on profiles
  for each row execute function public.prevent_second_super_admin();

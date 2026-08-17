-- EasyRent: fix 401s on public property queries after 00035 revoked anon
-- table-level SELECT on profiles (column-safe grants only).
--
-- Problem: RLS policies (properties / property_units / property_verifications)
-- embed `SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = ANY(...)`.
-- With only column-level grants, anon can no longer execute that subquery, so
-- PostgREST returns 401 for every public marketplace query.
--
-- Fix: move the admin/super_admin check into a SECURITY DEFINER helper so the
-- policy does not require the caller to hold table-level privileges on profiles.

create or replace function public.is_admin_or_super_admin(check_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where user_id = check_uid
      and role in ('admin', 'super_admin')
  )
$$;

-- 1) properties: public listing must not depend on anon reading profiles.
drop policy if exists "Published properties are public" on properties;
create policy "Published properties are public"
  on properties for select
  to public
  using (
    status = 'published'
    or owner_id = auth.uid()
    or public.is_admin_or_super_admin(auth.uid())
  );

-- 2) property_units: same subquery fix.
drop policy if exists "property_units_public_select" on property_units;
create policy "property_units_public_select"
  on property_units for select
  to public
  using (
    is_active = true
    or exists (
      select 1 from properties p
      where p.id = property_units.property_id
        and (p.owner_id = auth.uid() or public.is_admin_or_super_admin(auth.uid()))
    )
  );

-- 3) property_verifications: owner-id lookup uses granted columns (id, user_id);
--    the admin branch is replaced with the helper. The write policy also embedded
--    a profiles.role subquery which would break anon SELECTs (policies are OR'd).
drop policy if exists "prop_verification_select" on property_verifications;
create policy "prop_verification_select"
  on property_verifications for select
  to public
  using (
    exists (
      select 1 from properties p
      where p.id = property_verifications.property_id
        and p.owner_id = (select profiles.id from profiles where profiles.user_id = auth.uid())
    )
    or public.is_admin_or_super_admin(auth.uid())
  );

drop policy if exists "prop_verification_write" on property_verifications;
create policy "prop_verification_write"
  on property_verifications for all
  to public
  using (
    public.is_admin_or_super_admin(auth.uid())
  )
  with check (
    public.is_admin_or_super_admin(auth.uid())
  );

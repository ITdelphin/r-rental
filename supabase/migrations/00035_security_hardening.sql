-- EasyRent: Security Hardening (post-review) — Migration 00035
-- Fixes identified in the security review:
--   1. Self-service role escalation at signup (handle_new_user ignored metadata)
--   2. Anonymous PII leak: profiles readable by everyone incl. column access
--   3. audit_logs / newsletters never had RLS enabled
--   4. payment_transactions: any authenticated user could insert arbitrary status
--   5. notifications: insert with check(true) allowed targeting any user
--   6. maintenance_comments / attachments / assignments too open
--   7. storage buckets (cms / avatars / property-images) not owner-scoped
--   8. property-images object-delete path bug (wrong array index)

-- ============================================================
-- 1. Prevent self-service role escalation
--    A user may never choose their own role. Force 'tenant'.
--    Roles are only assigned by admins through the admin workflow.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, user_id, full_name, email, role)
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'tenant'
  );
  return new;
end;
$$;

-- Also guard against future after-insert profile row tampering with roles:
-- only an admin/super_admin may change a user's role, and a user can never
-- elevate their own role from the client.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if NEW.role is distinct from OLD.role then
    if auth.uid() is null then
      raise exception 'Role changes require a signed-in admin';
    end if;
    if not exists (
      select 1 from profiles
      where user_id = auth.uid()
        and role in ('admin', 'super_admin')
    ) then
      raise exception 'Only an admin may change roles';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on profiles;
create trigger trg_protect_profile_role
  before update of role on profiles
  for each row execute function public.protect_profile_role();

-- ============================================================
-- 2. Close the anonymous PII leak on profiles
--    Anonymous visitors may READ ONLY the columns the public
--    marketplace needs (name, avatar, verification status, location).
--    The sensitive columns (email, phone, national_id, address, bio,
--    suspension flag) are revoked from the anon role, so public joins
--    such as reviews(*) -> profiles(*) can no longer return PII.
-- ============================================================
revoke select on table public.profiles from anon;
grant select (
  id, user_id, full_name, avatar_url, is_verified,
  province, district, sector, created_at
) on table public.profiles to anon;

-- Keep RLS row policy meaningful for authenticated users and restrict
-- the broad public row-level read. Authenticated users keep the full
-- column set for dashboard and admin functionality.
drop policy if exists "Profiles are viewable by everyone" on profiles;
create policy "Profiles viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "Profiles viewable by anonymous (safe columns only)"
  on profiles for select
  to anon
  using (true);

-- ============================================================
-- 3. Enable RLS on audit_logs and newsletters (policies existed
--    but the tables were never RLS-protected).
-- ============================================================
alter table audit_logs enable row level security;
alter table newsletters enable row level security;

drop policy if exists "Super admins can view audit logs" on audit_logs;
create policy "Super admins can view audit logs"
  on audit_logs for select
  to authenticated
  using (
    exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin')
  );

drop policy if exists "Service role can insert audit logs" on audit_logs;
create policy "Service role can insert audit logs"
  on audit_logs for insert
  to service_role
  with check (true);

drop policy if exists "newsletters_select" on newsletters;
create policy "newsletters_select"
  on newsletters for select
  to authenticated
  using (false);

drop policy if exists "newsletters_insert" on newsletters;
create policy "newsletters_insert"
  on newsletters for insert
  to anon, authenticated
  with check (true);

-- ============================================================
-- 4. payment_transactions: only an initiated (pending) transaction
--    matching the caller may be created from the client; completed
--    transactions must be written server-side (service role).
-- ============================================================
drop policy if exists "payment_tx_client_insert" on payment_transactions;
create policy "payment_tx_client_insert"
  on payment_transactions for insert
  to authenticated
  with check (
    status = 'initiated'
    and exists (
      select 1 from payments py
      where py.id = payment_transactions.payment_id
        and py.payer_id = (select id from profiles where user_id = auth.uid())
    )
  );

-- ============================================================
-- 5. notifications: a user may only create a notification for
--    a legitimate recipient:
--      * themselves,
--      * a user they have a booking or application relationship with,
--      * a tenant, when the caller is a property owner (broadcast: new listing),
--      * anyone, when the caller is an admin / super admin.
-- ============================================================
drop policy if exists "authenticated_can_insert_notifications" on notifications;
create policy "authenticated_can_insert_notifications"
  on notifications for insert
  to authenticated
  with check (
    user_id = (select id from profiles where user_id = auth.uid())
    or exists (
      select 1 from bookings
      where (tenant_id = user_id or owner_id = user_id)
        and (tenant_id = (select id from profiles where user_id = auth.uid())
          or owner_id  = (select id from profiles where user_id = auth.uid()))
    )
    or exists (
      select 1 from rental_applications
      where (applicant_id = user_id or owner_id = user_id)
        and (applicant_id = (select id from profiles where user_id = auth.uid())
          or owner_id      = (select id from profiles where user_id = auth.uid()))
    )
    or (
      -- property owner broadcasting a new listing to tenants
      exists (select 1 from properties where owner_id = (select id from profiles where user_id = auth.uid()))
      and exists (select 1 from profiles p where p.id = user_id and p.role = 'tenant')
    )
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

-- ============================================================
-- 6. Maintenance workflow: comments / attachments restricted to
--    the request's participants; assignments read/update restricted.
-- ============================================================
-- Comments: only a participant (tenant / property owner / admin) may add.
drop policy if exists "maint_comments_insert" on maintenance_comments;
create policy "maint_comments_insert"
  on maintenance_comments for insert
  to authenticated
  with check (
    EXISTS (
      SELECT 1 FROM maintenance_requests mr
      JOIN properties p ON p.id = mr.property_id
      WHERE mr.id = maintenance_comments.request_id
        AND (mr.tenant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
          OR p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
    )
  );

-- Attachments: same participant rule.
drop policy if exists "maint_attachments_insert" on maintenance_attachments;
create policy "maint_attachments_insert"
  on maintenance_attachments for insert
  to authenticated
  with check (
    EXISTS (
      SELECT 1 FROM maintenance_requests mr
      JOIN properties p ON p.id = mr.property_id
      WHERE mr.id = maintenance_attachments.request_id
        AND (mr.tenant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
          OR p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
    )
  );

-- Assignments: read only by participants / admins, not every user.
drop policy if exists "maint_assignments_select" on maintenance_assignments;
create policy "maint_assignments_select"
  on maintenance_assignments for select
  to authenticated
  using (
    EXISTS (
      SELECT 1 FROM maintenance_requests mr
      JOIN properties p ON p.id = mr.property_id
      WHERE mr.id = maintenance_assignments.request_id
        AND (mr.tenant_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
          OR p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
          OR maintenance_assignments.assignee_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
    )
  );

-- Assignments: only property owner / admin may update.
drop policy if exists "maint_assignments_admin_update" on maintenance_assignments;
create policy "maint_assignments_admin_update"
  on maintenance_assignments for update
  to authenticated
  using (
    EXISTS (
      SELECT 1 FROM maintenance_requests mr
      JOIN properties p ON p.id = mr.property_id
      WHERE mr.id = maintenance_assignments.request_id
        AND (p.owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
          OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
    )
  );

-- ============================================================
-- 7. Storage buckets: scope writes/deletes to owners/super admins.
-- ============================================================
-- CMS media: only super admins upload/delete (matches settings access).
drop policy if exists "Authenticated users can upload CMS media" on storage.objects;
create policy "Super admins can upload CMS media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cms'
    and exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin')
  );

drop policy if exists "Authenticated users can delete CMS media" on storage.objects;
create policy "Super admins can delete CMS media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cms'
    and exists (select 1 from profiles where user_id = auth.uid() and role = 'super_admin')
  );

-- Avatars: update/delete only within the user's own folder (u/{uid}/).
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid() = (select (string_to_array(name, '/'))[2]::uuid)
  );

drop policy if exists "Users can update own avatars" on storage.objects;
create policy "Users can update own avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid() = (select (string_to_array(name, '/'))[2]::uuid)
  );

drop policy if exists "Users can delete own avatars" on storage.objects;
create policy "Users can delete own avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid() = (select (string_to_array(name, '/'))[2]::uuid)
  );

-- Property images upload: owner of the property OR owner prefix in path.
drop policy if exists "Authenticated users can upload property images" on storage.objects;
create policy "Authenticated users can upload property images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and auth.uid() = (select (string_to_array(name, '/'))[2]::uuid)
  );

-- Fix property-images object-delete path bug: previously used [1]
-- (the literal folder "properties") which cannot cast to uuid, so
-- deletes always failed. The owner id is at index [2].
drop policy if exists "Owners can delete own property images" on storage.objects;
create policy "Owners can delete own property images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and auth.uid() = (select (string_to_array(name, '/'))[2]::uuid)
  );

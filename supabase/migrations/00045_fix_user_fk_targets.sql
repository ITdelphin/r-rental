-- 00045: Align user foreign keys and RLS with auth.uid() live model
-- Live schema: profiles.id = random uuid, profiles.user_id = auth.uid() (unique).
-- Frontend writes user.id (auth.uid()) to all user-reference columns, so user FKs
-- must target profiles(user_id) (== auth.users.id), and RLS must compare auth.uid().

-- ---------------------------------------------------------------------------
-- 1. Repoint user foreign keys from profiles(id) to profiles(user_id)
--    (all these tables currently hold 0 rows, so this is data-safe)
-- ---------------------------------------------------------------------------

alter table public.favorites
  drop constraint favorites_user_id_fkey,
  add constraint favorites_user_id_fkey
    foreign key (user_id) references public.profiles(user_id) on delete cascade;

alter table public.rental_applications
  drop constraint rental_applications_applicant_id_fkey,
  add constraint rental_applications_applicant_id_fkey
    foreign key (applicant_id) references public.profiles(user_id) on delete cascade;

alter table public.rental_applications
  drop constraint rental_applications_owner_id_fkey,
  add constraint rental_applications_owner_id_fkey
    foreign key (owner_id) references public.profiles(user_id) on delete set null;

alter table public.rental_applications
  drop constraint rental_applications_reviewed_by_fkey,
  add constraint rental_applications_reviewed_by_fkey
    foreign key (reviewed_by) references public.profiles(user_id) on delete set null;

alter table public.payments
  drop constraint payments_payer_id_fkey,
  add constraint payments_payer_id_fkey
    foreign key (payer_id) references public.profiles(user_id) on delete cascade;

alter table public.payments
  drop constraint payments_payee_id_fkey,
  add constraint payments_payee_id_fkey
    foreign key (payee_id) references public.profiles(user_id) on delete cascade;

alter table public.complaints
  drop constraint complaints_user_id_fkey,
  add constraint complaints_user_id_fkey
    foreign key (user_id) references public.profiles(user_id) on delete cascade;

alter table public.reviews
  drop constraint reviews_user_id_fkey,
  add constraint reviews_user_id_fkey
    foreign key (user_id) references public.profiles(user_id) on delete cascade;

alter table public.contracts
  drop constraint contracts_tenant_id_fkey,
  add constraint contracts_tenant_id_fkey
    foreign key (tenant_id) references public.profiles(user_id) on delete cascade;

alter table public.contracts
  drop constraint contracts_owner_id_fkey,
  add constraint contracts_owner_id_fkey
    foreign key (owner_id) references public.profiles(user_id) on delete cascade;

alter table public.property_reports
  drop constraint property_reports_reported_by_fkey,
  add constraint property_reports_reported_by_fkey
    foreign key (reported_by) references public.profiles(user_id) on delete set null;

alter table public.property_reports
  drop constraint property_reports_resolved_by_fkey,
  add constraint property_reports_resolved_by_fkey
    foreign key (resolved_by) references public.profiles(user_id) on delete set null;

alter table public.documents
  drop constraint documents_owner_id_fkey,
  add constraint documents_owner_id_fkey
    foreign key (owner_id) references public.profiles(user_id) on delete cascade;

alter table public.documents
  drop constraint documents_uploaded_by_fkey,
  add constraint documents_uploaded_by_fkey
    foreign key (uploaded_by) references public.profiles(user_id) on delete set null;

alter table public.data_requests
  drop constraint data_requests_user_id_fkey,
  add constraint data_requests_user_id_fkey
    foreign key (user_id) references public.profiles(user_id) on delete cascade;

alter table public.data_requests
  drop constraint data_requests_handled_by_fkey,
  add constraint data_requests_handled_by_fkey
    foreign key (handled_by) references public.profiles(user_id) on delete set null;

alter table public.saved_searches
  drop constraint saved_searches_user_id_fkey,
  add constraint saved_searches_user_id_fkey
    foreign key (user_id) references public.profiles(user_id) on delete cascade;

alter table public.owner_verifications
  drop constraint owner_verifications_owner_id_fkey,
  add constraint owner_verifications_owner_id_fkey
    foreign key (owner_id) references public.profiles(user_id) on delete cascade;

alter table public.owner_verifications
  drop constraint owner_verifications_verified_by_fkey,
  add constraint owner_verifications_verified_by_fkey
    foreign key (verified_by) references public.profiles(user_id) on delete set null;

alter table public.maintenance_requests
  drop constraint maintenance_requests_tenant_id_fkey,
  add constraint maintenance_requests_tenant_id_fkey
    foreign key (tenant_id) references public.profiles(user_id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 2. payments.method must accept the 'card' value sent by TenantBookings UI
-- ---------------------------------------------------------------------------

alter table public.payments
  drop constraint payments_method_check,
  add constraint payments_method_check
    check (method in ('mtn_momo', 'airtel_money', 'visa', 'mastercard', 'flutterwave', 'card'));

-- ---------------------------------------------------------------------------
-- 3. Fix RLS policies that compared against profiles.id (random uuid)
-- ---------------------------------------------------------------------------

-- payments: add full CRUD (previously no policies -> all blocked)
drop policy if exists payments_payer_insert on public.payments;
create policy payments_payer_insert on public.payments
  for insert to authenticated
  with check (payer_id = auth.uid() or exists (
    select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
  ));

drop policy if exists payments_self_select on public.payments;
create policy payments_self_select on public.payments
  for select to authenticated
  using (
    payer_id = auth.uid() or payee_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

drop policy if exists payments_self_update on public.payments;
create policy payments_self_update on public.payments
  for update to authenticated
  using (
    payer_id = auth.uid() or payee_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

-- complaints: add insert + select + update (admin view + self submit)
drop policy if exists complaints_self_insert on public.complaints;
create policy complaints_self_insert on public.complaints
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists complaints_admin_select on public.complaints;
create policy complaints_admin_select on public.complaints
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin', 'agent')
    )
  );

drop policy if exists complaints_admin_update on public.complaints;
create policy complaints_admin_update on public.complaints
  for update to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin', 'agent')
    )
  );

-- contracts: add insert + select + update (owner generates, tenant/owner/admin view)
drop policy if exists contracts_owner_insert on public.contracts;
create policy contracts_owner_insert on public.contracts
  for insert to authenticated
  with check (owner_id = auth.uid() or exists (
    select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
  ));

drop policy if exists contracts_participant_select on public.contracts;
create policy contracts_participant_select on public.contracts
  for select to authenticated
  using (
    tenant_id = auth.uid() or owner_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

drop policy if exists contracts_participant_update on public.contracts;
create policy contracts_participant_update on public.contracts
  for update to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin', 'agent')
    )
  );

-- maintenance_requests: add insert + select + update (tenant submits, owner/admin manages)
drop policy if exists maintenance_tenant_insert on public.maintenance_requests;
create policy maintenance_tenant_insert on public.maintenance_requests
  for insert to authenticated
  with check (tenant_id = auth.uid());

drop policy if exists maintenance_participant_select on public.maintenance_requests;
create policy maintenance_participant_select on public.maintenance_requests
  for select to authenticated
  using (
    tenant_id = auth.uid()
    or exists (
      select 1 from public.properties p
      where p.id = maintenance_requests.property_id and p.owner_id = auth.uid()
    ) or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin', 'agent')
    )
  );

drop policy if exists maintenance_participant_update on public.maintenance_requests;
create policy maintenance_participant_update on public.maintenance_requests
  for update to authenticated
  using (
    tenant_id = auth.uid()
    or exists (
      select 1 from public.properties p
      where p.id = maintenance_requests.property_id and p.owner_id = auth.uid()
    ) or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin', 'agent')
    )
  );

-- rental_applications: replace profiles.id subqueries with auth.uid()
drop policy if exists rental_apps_tenant_insert on public.rental_applications;
create policy rental_apps_tenant_insert on public.rental_applications
  for insert to authenticated
  with check (applicant_id = auth.uid() and status = 'pending');

drop policy if exists rental_apps_select_own on public.rental_applications;
create policy rental_apps_select_own on public.rental_applications
  for select to authenticated
  using (
    applicant_id = auth.uid() or owner_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

drop policy if exists rental_apps_owner_update on public.rental_applications;
create policy rental_apps_owner_update on public.rental_applications
  for update to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

drop policy if exists rental_apps_owner_admin_delete on public.rental_applications;
create policy rental_apps_owner_admin_delete on public.rental_applications
  for delete to authenticated
  using (
    applicant_id = auth.uid() or owner_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

-- property_reports: owner check should be auth.uid() (properties.owner_id is auth uid)
drop policy if exists property_reports_select on public.property_reports;
create policy property_reports_select on public.property_reports
  for select to authenticated
  using (
    exists (
      select 1 from public.properties p where p.id = property_reports.property_id and p.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

drop policy if exists property_reports_insert on public.property_reports;
create policy property_reports_insert on public.property_reports
  for insert to authenticated
  with check (reported_by = auth.uid() and status = 'reported');

-- documents: replace profiles.id subqueries with auth.uid()
drop policy if exists documents_owner_insert on public.documents;
create policy documents_owner_insert on public.documents
  for insert to authenticated
  with check (
    owner_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
  for select to authenticated
  using (
    owner_id = auth.uid() or is_public = true
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

drop policy if exists documents_owner_update on public.documents;
create policy documents_owner_update on public.documents
  for update to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

drop policy if exists documents_owner_delete on public.documents;
create policy documents_owner_delete on public.documents
  for delete to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

-- saved_searches: replace profiles.id subqueries with auth.uid()
drop policy if exists saved_searches_self_insert on public.saved_searches;
create policy saved_searches_self_insert on public.saved_searches
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists saved_searches_self on public.saved_searches;
create policy saved_searches_self on public.saved_searches
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists saved_searches_self_update on public.saved_searches;
create policy saved_searches_self_update on public.saved_searches
  for update to authenticated
  using (user_id = auth.uid());

drop policy if exists saved_searches_self_delete on public.saved_searches;
create policy saved_searches_self_delete on public.saved_searches
  for delete to authenticated
  using (user_id = auth.uid());

-- data_requests: replace profiles.id subqueries with auth.uid()
drop policy if exists data_requests_self_insert on public.data_requests;
create policy data_requests_self_insert on public.data_requests
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');

drop policy if exists data_requests_self_select on public.data_requests;
create policy data_requests_self_select on public.data_requests
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

-- notifications: INSERT relied on profiles.id subqueries; rewrite so the frontend's
-- createNotification(user_id = auth uid) works for self, admins and booking participants
drop policy if exists authenticated_can_insert_notifications on public.notifications;
create policy authenticated_can_insert_notifications on public.notifications
  for insert to authenticated
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
    or exists (
      select 1 from public.bookings b
      where (b.tenant_id = auth.uid() and b.owner_id = notifications.user_id)
         or (b.owner_id = auth.uid() and b.tenant_id = notifications.user_id)
    )
    or (
      exists (select 1 from public.properties pr where pr.owner_id = auth.uid())
      and exists (select 1 from public.profiles pt where pt.user_id = notifications.user_id and pt.role = 'tenant')
    )
  );

-- owner_verifications: owner_id is stored as auth uid
drop policy if exists owner_verification_select on public.owner_verifications;
create policy owner_verification_select on public.owner_verifications
  for select to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );
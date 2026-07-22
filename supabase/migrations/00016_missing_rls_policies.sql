-- RLS policies for complaints table
drop policy if exists "Users can view own complaints" on complaints;
create policy "Users can view own complaints" on complaints
  for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

drop policy if exists "Users can create complaints" on complaints;
create policy "Users can create complaints" on complaints
  for insert with check (auth.uid() = user_id);

drop policy if exists "Admins can update complaints" on complaints;
create policy "Admins can update complaints" on complaints
  for update using (
    exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );


-- RLS policies for payments table
drop policy if exists "Users can view own payments" on payments;
create policy "Users can view own payments" on payments
  for select using (
    payer_id = auth.uid()
    or payee_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

drop policy if exists "Payer can insert payments" on payments;
create policy "Payer can insert payments" on payments
  for insert with check (payer_id = auth.uid());

drop policy if exists "Admins or payees can update payments" on payments;
create policy "Admins or payees can update payments" on payments
  for update using (
    payee_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );


-- RLS policies for contracts table
drop policy if exists "Users can view own contracts" on contracts;
create policy "Users can view own contracts" on contracts
  for select using (
    tenant_id = auth.uid()
    or owner_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

drop policy if exists "Owners or admins can insert contracts" on contracts;
create policy "Owners or admins can insert contracts" on contracts
  for insert with check (
    owner_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

drop policy if exists "Owners or admins can update contracts" on contracts;
create policy "Owners or admins can update contracts" on contracts
  for update using (
    owner_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );


-- RLS policies for maintenance_requests table
drop policy if exists "Users can view own maintenance requests" on maintenance_requests;
create policy "Users can view own maintenance requests" on maintenance_requests
  for select using (
    tenant_id = auth.uid()
    or exists (select 1 from properties where id = property_id and owner_id = auth.uid())
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

drop policy if exists "Tenants or admins can insert maintenance requests" on maintenance_requests;
create policy "Tenants or admins can insert maintenance requests" on maintenance_requests
  for insert with check (
    tenant_id = auth.uid()
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

drop policy if exists "Tenants, owners, or admins can update maintenance requests" on maintenance_requests;
create policy "Tenants, owners, or admins can update maintenance requests" on maintenance_requests
  for update using (
    tenant_id = auth.uid()
    or exists (select 1 from properties where id = property_id and owner_id = auth.uid())
    or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin'))
  );

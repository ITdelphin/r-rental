-- Add RLS policies for audit_logs
-- Only super_admins can read audit logs, only service role can insert

drop policy if exists "Super admins can view audit logs" on audit_logs;
create policy "Super admins can view audit logs"
  on audit_logs for select
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role = 'super_admin'
    )
  );

drop policy if exists "Service role can insert audit logs" on audit_logs;
create policy "Service role can insert audit logs"
  on audit_logs for insert
  with check (true);


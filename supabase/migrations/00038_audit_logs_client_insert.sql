-- Allow authenticated users to insert audit log entries from the client.
-- The app writes audit logs via src/lib/audit.ts using the signed-in user's
-- session, but 00035 restricted INSERT to service_role, causing 403s.

drop policy if exists "Authenticated users can insert audit logs" on audit_logs;

create policy "Authenticated users can insert audit logs"
  on audit_logs for insert
  to authenticated
  with check (
    auth.uid() = user_id
  );

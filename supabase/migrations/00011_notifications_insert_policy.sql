-- Allow authenticated users to insert notifications (system notifications for other users)
drop policy if exists "authenticated_can_insert_notifications" on notifications;
create policy "authenticated_can_insert_notifications"
  on notifications for insert
  to authenticated
  with check (true);

-- Allow authenticated users to insert notifications (system notifications for other users)
drop policy if exists "authenticated_can_insert_notifications" on notifications;
create policy "authenticated_can_insert_notifications"
  on notifications for insert
  to authenticated
  with check (true);

-- Allow users to see notifications for their profile (via profiles.user_id join)
drop policy if exists "Users can view own notifications" on notifications;
create policy "Users can view own notifications"
  on notifications for select
  using (
    user_id = auth.uid()
    or user_id in (select id from profiles where user_id = auth.uid())
  );

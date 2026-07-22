-- Allow users to delete their own notifications
drop policy if exists "Users can delete own notifications" on notifications;
create policy "Users can delete own notifications"
  on notifications for delete
  using (user_id = auth.uid());

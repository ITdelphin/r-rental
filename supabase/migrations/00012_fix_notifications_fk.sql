-- Fix notifications FK to reference profiles(user_id) instead of profiles(id)
-- profiles.user_id references auth.users(id), matching the auth.uid() used in frontend queries
alter table notifications
  drop constraint if exists notifications_user_id_fkey,
  add constraint notifications_user_id_fkey
    foreign key (user_id) references profiles(user_id) on delete cascade;

-- Revert select policy to simple auth.uid() check since user_id now matches
drop policy if exists "Users can view own notifications" on notifications;
create policy "Users can view own notifications"
  on notifications for select
  using (user_id = auth.uid());

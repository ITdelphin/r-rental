-- Fix audit_logs.user_id FK: it referenced profiles(id), but profiles.id is a
-- random UUID while the app writes auth.uid() (= profiles.user_id / auth.users.id).
-- Point it at auth.users.id, matching email_logs.

alter table audit_logs
  drop constraint if exists audit_logs_user_id_fkey;

alter table audit_logs
  add constraint audit_logs_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;
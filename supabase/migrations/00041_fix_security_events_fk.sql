-- Fix security_events FKs + audit triggers: they referenced profiles(id), but
-- profiles.id is a random UUID while log_role_change / log_payment_state_change
-- write auth.uid() (auth user id) for actor_id and NEW.user_id for the target.
-- Repoint both FKs at auth.users(id), consistently with email_logs and audit_logs,
-- and fix log_role_change to store NEW.user_id (the auth user id), not NEW.id.

alter table security_events
  drop constraint if exists security_events_actor_id_fkey,
  drop constraint if exists security_events_user_id_fkey;

alter table security_events
  add constraint security_events_actor_id_fkey
  foreign key (actor_id) references auth.users(id) on delete set null;

alter table security_events
  add constraint security_events_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

create or replace function public.log_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) then
    insert into security_events (event_type, user_id, actor_id, success, details)
    values ('role_change', NEW.user_id, auth.uid(),
            coalesce(is_super_admin(), false),
            jsonb_build_object('from', OLD.role, 'to', NEW.role));
  end if;
  return NEW;
end;
$$;
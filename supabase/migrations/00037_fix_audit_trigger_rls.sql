-- EasyRent: Fix audit triggers broken by RLS on security_events
-- Migration 00037
--
-- Problem: log_role_change (AFTER UPDATE OF role) and log_payment_state_change
-- (AFTER UPDATE OF status) insert into security_events, whose only INSERT
-- policy allows service_role. The trigger functions were NOT security definer,
-- so they ran as the signed-in user (e.g. an admin), the INSERT violated RLS,
-- and the entire UPDATE rolled back -> role changes silently failed.
--
-- Fix: make the audit/log trigger functions SECURITY DEFINER so they can write
-- the audit trail regardless of the caller's role. Also harden the related
-- trigger functions the same way for consistency.

create or replace function public.log_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role) then
    insert into security_events (event_type, user_id, actor_id, success, details)
    values ('role_change', NEW.id, auth.uid(),
            coalesce(is_super_admin(), false),
            jsonb_build_object('from', OLD.role, 'to', NEW.role));
  end if;
  return NEW;
end;
$$;

create or replace function public.log_payment_state_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) then
    insert into security_events (event_type, user_id, actor_id, success, details)
    values ('payment_state_change', NULL, auth.uid(),
            NEW.status = 'successful',
            jsonb_build_object('transaction_id', NEW.id, 'from', OLD.status, 'to', NEW.status, 'amount', NEW.amount));
  end if;
  return NEW;
end;
$$;

create or replace function public.sync_unit_from_booking()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if NEW.unit_id IS NULL then return NEW; end if;
  update property_units set updated_at = now()
  where id = NEW.unit_id;
  return NEW;
end;
$$;

create or replace function public.protect_system_settings()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  protected_keys text[] := ARRAY[
    'platform_name', 'support_email', 'phone_number', 'address',
    'logo_url', 'favicon_url', 'hero_background', 'base_currency'
  ];
begin
  if (TG_OP = 'DELETE') then
    if (OLD.key = ANY (protected_keys)) AND NOT is_super_admin() then
      raise exception 'SYSTEM_PROTECTED setting "%" cannot be modified by this role', OLD.key;
    end if;
    return OLD;
  end if;

  if (COALESCE(NEW.key, OLD.key) = ANY (protected_keys)) AND NOT is_super_admin() then
    raise exception 'SYSTEM_PROTECTED setting "%" cannot be modified by this role', COALESCE(NEW.key, OLD.key);
  end if;

  return NEW;
end;
$$;

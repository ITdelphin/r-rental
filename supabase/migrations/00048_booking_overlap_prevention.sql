-- Prevent double-booking via DB-level check (complements client-side overlap check)
-- Handles concurrent inserts that bypass client-side select-then-insert race

-- Function to check availability: returns true if no overlapping pending/approved booking
create or replace function is_property_available(
  p_property_id uuid,
  p_check_in date,
  p_check_out date,
  p_exclude_id uuid default null
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_check_in is null or p_check_out is null then
    return true;
  end if;
  if p_check_out <= p_check_in then
    return false;
  end if;
  return not exists (
    select 1 from bookings b
    where b.property_id = p_property_id
      and b.status in ('pending','approved')
      and b.check_in is not null and b.check_out is not null
      and b.check_in < p_check_out
      and b.check_out > p_check_in
      and (p_exclude_id is null or b.id != p_exclude_id)
  );
end;
$$;

-- Trigger to block overlapping inserts/updates
create or replace function prevent_overlapping_booking()
returns trigger
language plpgsql
as $$
begin
  if NEW.check_in is not null and NEW.check_out is not null then
    if not is_property_available(NEW.property_id, NEW.check_in, NEW.check_out, NEW.id) then
      raise exception 'Property not available for selected dates (overlapping booking exists) %', NEW.property_id
        using errcode = 'P0001';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_prevent_overlapping_booking on bookings;
create trigger trg_prevent_overlapping_booking
  before insert or update of property_id, check_in, check_out, status on bookings
  for each row execute function prevent_overlapping_booking();

-- Also add index to speed up overlap checks
create index if not exists idx_bookings_overlap on bookings(property_id, status, check_in, check_out) where status in ('pending','approved');

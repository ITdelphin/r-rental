-- Modify listing_fees to be per-property instead of time-based
alter table listing_fees
  drop column if exists expires_at,
  add column if not exists is_used boolean not null default false,
  add column if not exists property_id uuid references properties(id) on delete set null;

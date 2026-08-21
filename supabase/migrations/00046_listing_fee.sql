-- Listing fee payments: owners/agents must pay 10,000 RWF to list a property
create table if not exists listing_fees (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  amount       integer not null default 10000,
  currency     text not null default 'RWF',
  method       text not null, -- mtn_momo | airtel_money | card | bank
  phone_number text,
  transaction_id text,
  status       text not null default 'pending' check (status in ('pending','completed','failed')),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '24 hours')
);

-- RLS
alter table listing_fees enable row level security;

-- Users can view their own fees
create policy "Users view own listing fees"
  on listing_fees for select
  using (user_id = auth.uid());

-- Users can insert their own fee records
create policy "Users insert own listing fees"
  on listing_fees for insert
  with check (user_id = auth.uid());

-- Admins/super_admins can see all
create policy "Admins view all listing fees"
  on listing_fees for select
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role in ('admin','super_admin')
    )
  );

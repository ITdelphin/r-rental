-- Rwanda EasyRent Database Schema

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('super_admin', 'admin', 'owner', 'tenant', 'agent')) default 'tenant',
  avatar_url text,
  national_id text,
  province text,
  district text,
  sector text,
  cell text,
  village text,
  address text,
  bio text,
  is_verified boolean default false,
  is_suspended boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Properties table
create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null default 'Rent' check (category in ('Rent', 'Sale', 'Short-term')),
  property_type text not null check (property_type in ('House', 'Apartment', 'Villa', 'Cottage', 'Studio', 'Commercial')),
  bedrooms integer default 1,
  bathrooms integer default 1,
  kitchen integer default 1,
  parking boolean default false,
  balcony boolean default false,
  garden boolean default false,
  swimming_pool boolean default false,
  security boolean default false,
  internet boolean default false,
  water boolean default true,
  electricity boolean default true,
  furnished boolean default false,
  price numeric(12, 0) not null,
  deposit numeric(12, 0),
  province text,
  district text,
  sector text,
  cell text,
  village text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'published', 'rejected', 'sold', 'rented')),
  is_featured boolean default false,
  views_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Property Images
create table if not exists property_images (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  url text not null,
  is_floor_plan boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Property Videos
create table if not exists property_videos (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  url text not null,
  created_at timestamptz default now()
);

-- Amenities
create table if not exists amenities (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Bookings
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  tenant_id uuid references profiles(id) on delete cascade not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  visit_date timestamptz,
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payments
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  payer_id uuid references profiles(id) on delete cascade not null,
  payee_id uuid references profiles(id) on delete cascade not null,
  amount numeric(12, 0) not null,
  currency text default 'RWF',
  method text not null check (method in ('mtn_momo', 'airtel_money', 'visa', 'mastercard', 'flutterwave')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text,
  receipt_url text,
  created_at timestamptz default now()
);

-- Reviews
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(property_id, user_id)
);

-- Favorites
create table if not exists favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

-- Messages
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  property_id uuid references properties(id) on delete set null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  body text,
  type text not null default 'general',
  is_read boolean default false,
  data jsonb,
  created_at timestamptz default now()
);

-- Maintenance Requests
create table if not exists maintenance_requests (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  tenant_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Complaints
create table if not exists complaints (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  subject text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contracts
create table if not exists contracts (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  tenant_id uuid references profiles(id) on delete cascade not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  monthly_rent numeric(12, 0) not null,
  deposit_amount numeric(12, 0) not null,
  status text not null default 'active' check (status in ('active', 'expired', 'terminated')),
  document_url text,
  created_at timestamptz default now()
);

-- CMS Pages
create table if not exists cms_pages (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  content text,
  meta_title text,
  meta_description text,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Settings
create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Newsletters
create table if not exists newsletters (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Audit Logs
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- Create indexes
create index idx_properties_status on properties(status);
create index idx_properties_owner on properties(owner_id);
create index idx_properties_location on properties(province, district);
create index idx_bookings_tenant on bookings(tenant_id);
create index idx_bookings_owner on bookings(owner_id);
create index idx_bookings_property on bookings(property_id);
create index idx_bookings_status on bookings(status);
create index idx_messages_sender on messages(sender_id);
create index idx_messages_receiver on messages(receiver_id);
create index idx_notifications_user on notifications(user_id);
create index idx_favorites_user on favorites(user_id);
create index idx_reviews_property on reviews(property_id);
create index idx_payments_payer on payments(payer_id);
create index idx_payments_payee on payments(payee_id);

-- Enable RLS (Row Level Security)
alter table profiles enable row level security;
alter table properties enable row level security;
alter table property_images enable row level security;
alter table property_videos enable row level security;
alter table amenities enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table favorites enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table maintenance_requests enable row level security;
alter table complaints enable row level security;
alter table contracts enable row level security;
alter table cms_pages enable row level security;
alter table settings enable row level security;

-- RLS Policies

-- Profiles: users can read all profiles, update their own
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);

-- Properties: published are public, owners manage own
create policy "Published properties are public" on properties for select using (status = 'published' or owner_id = auth.uid() or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin')));
create policy "Owners can insert properties" on properties for insert with check (owner_id = auth.uid() or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin')));
create policy "Owners can update own properties" on properties for update using (owner_id = auth.uid() or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin')));
create policy "Owners can delete own properties" on properties for delete using (owner_id = auth.uid() or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin')));

-- Bookings
create policy "Users can view own bookings" on bookings for select using (tenant_id = auth.uid() or owner_id = auth.uid() or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin')));
create policy "Tenants can create bookings" on bookings for insert with check (tenant_id = auth.uid());
create policy "Owners can update booking status" on bookings for update using (owner_id = auth.uid() or exists (select 1 from profiles where user_id = auth.uid() and role in ('admin', 'super_admin')));

-- Reviews
create policy "Reviews are public" on reviews for select using (true);
create policy "Users can create reviews" on reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on reviews for delete using (auth.uid() = user_id);

-- Favorites
create policy "Users can view own favorites" on favorites for select using (auth.uid() = user_id);
create policy "Users can add favorites" on favorites for insert with check (auth.uid() = user_id);
create policy "Users can remove own favorites" on favorites for delete using (auth.uid() = user_id);

-- Messages
create policy "Users can view own messages" on messages for select using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "Users can send messages" on messages for insert with check (sender_id = auth.uid());
create policy "Users can mark messages as read" on messages for update using (receiver_id = auth.uid());

-- Notifications
create policy "Users can view own notifications" on notifications for select using (user_id = auth.uid());
create policy "Users can update own notifications" on notifications for update using (user_id = auth.uid());

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'tenant')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

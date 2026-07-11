-- Email Logs table for tracking sent emails

create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  recipient text not null,
  email_type text not null,
  subject text not null,
  status text not null default 'pending',
  error_message text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table email_logs enable row level security;

-- Only admins and super_admins can view email logs
create policy "Admins can view email logs"
  on email_logs for select
  using (
    exists (
      select 1 from profiles
      where user_id = auth.uid()
      and role in ('admin', 'super_admin')
    )
  );

-- Allow service role to insert (Edge Functions)
create policy "Service role can insert email logs"
  on email_logs for insert
  with check (true);

-- Index for faster queries
create index idx_email_logs_user on email_logs(user_id);
create index idx_email_logs_type on email_logs(email_type);
create index idx_email_logs_created on email_logs(created_at desc);

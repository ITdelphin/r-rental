-- Add reply_message column to bookings table for owner responses
alter table bookings
  add column if not exists reply_message text;


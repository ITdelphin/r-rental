-- Add check_in and check_out date columns to bookings
alter table bookings
  add column if not exists check_in date,
  add column if not exists check_out date;


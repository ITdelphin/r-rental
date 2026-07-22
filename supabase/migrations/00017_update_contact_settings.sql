-- Update contact settings with new contact information
insert into settings (key, value) values
  ('support_email', 'delphinngarambe@gmail.com'),
  ('phone_number', '0782680268'),
  ('address', 'Gisenyi, Rwanda')
on conflict (key) do update set value = excluded.value, updated_at = now();

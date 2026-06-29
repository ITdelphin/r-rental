-- Seed data for development

-- Insert CMS pages
insert into cms_pages (slug, title, content, is_published) values
  ('homepage', 'Homepage', 'Welcome to Rwanda EasyRent - Find Your Perfect Home in Rwanda', true),
  ('about', 'About Us', 'Rwanda EasyRent is a modern property rental platform designed for the Rwandan market.', true),
  ('privacy', 'Privacy Policy', 'Your privacy is important to us.', true),
  ('terms', 'Terms of Service', 'By using Rwanda EasyRent, you agree to these terms.', true),
  ('faq', 'FAQ', 'Find answers to common questions.', true);

-- Insert default settings
insert into settings (key, value) values
  ('platform_name', 'Rwanda EasyRent'),
  ('support_email', 'support@rwanda-easyrent.com'),
  ('support_phone', '+250 788 000 000'),
  ('address', 'Kigali, Rwanda'),
  ('primary_color', '#2563eb'),
  ('user_registration', 'open'),
  ('property_auto_approval', 'false'),
  ('currency', 'RWF');

-- Insert sample properties (requires a user to exist first)
-- Note: Replace the owner_id with an actual user UUID after registration
-- insert into properties (owner_id, title, description, category, property_type, bedrooms, bathrooms, price, province, district, sector, status) values
--   ('<USER_UUID>', 'Modern Apartment in Kicukiro', 'A beautiful modern apartment in the heart of Kicukiro.', 'Rent', 'Apartment', 2, 1, 250000, 'Kigali', 'Kicukiro', 'Kicukiro', 'published'),
--   ('<USER_UUID>', 'Villa with Pool in Musanze', 'Spacious villa with swimming pool near Volcanoes National Park.', 'Rent', 'Villa', 4, 3, 500000, 'Northern', 'Musanze', 'Musanze', 'published'),
--   ('<USER_UUID>', 'Studio in Kimihurura', 'Cozy studio apartment in the vibrant Kimihurura neighborhood.', 'Rent', 'Studio', 1, 1, 150000, 'Kigali', 'Gasabo', 'Kimihurura', 'published');

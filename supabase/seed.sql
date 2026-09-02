-- Sample rooms for local testing. Not part of the migration chain —
-- Supabase runs supabase/seed.sql separately (e.g. on `supabase db reset`).
-- Delete or replace once real rooms and photos exist.

insert into public.rooms (name, room_type, description, capacity, price_per_night) values
  ('Garden Room', 'double', 'A quiet double room overlooking the courtyard garden, with a private bathroom and a writing desk.', 2, 950.00),
  ('Loft Room', 'single', 'A snug single room under the eaves with a skylight — good for one traveler who doesn''t mind stairs.', 1, 650.00),
  ('Courtyard Suite', 'suite', 'The largest room: a separate sitting area, a queen bed, and doors that open onto the courtyard.', 3, 1450.00),
  ('Terrace Room', 'double', 'A double room with its own small terrace, best for morning coffee.', 2, 1050.00);

-- Run this if you want to test with some basic data in the new tables
INSERT INTO platforms (name, slug) VALUES ('Agragati Platform', 'agragati') ON CONFLICT DO NOTHING;

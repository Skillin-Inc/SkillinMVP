-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

INSERT INTO "users" (
  "first_name", "last_name", "email", "phone_number", "username", 
  "hashed_password", "postal_code", "is_teacher"
) VALUES
  ('Demo', 'Student', 'student@email.com', '1231231234', 'studentdemo', 'Password', 99999, false),
  ('Demo', 'Teacher', 'teacher@email.com', '5551234567', 'teacherdemo', 'Password', 99999, true);

INSERT INTO "categories" ("title") VALUES 
  ('Basketball'),
  ('Skiing'),
  ('Soccer'),
  ('Tennis'),
  ('Baseball'),
  ('Snowboarding'),
  ('Poker'),
  ('Football');

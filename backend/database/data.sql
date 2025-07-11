-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

-- STEP 1: Insert categories

INSERT INTO "categories" ("id", "title") VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Poker'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Sports Betting'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Basketball'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Pickleball'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Gaming'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Cooking'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Personal Finance'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Self Care'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Dating'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Communication'),
  ('550e8400-e29b-41d4-a716-44665544000a', 'Snowboarding'),
  ('550e8400-e29b-41d4-a716-44665544000b', 'Skiing');

-- STEP 2: Insert users (student, teacher, and admin)
INSERT INTO "users" (
  "id", "first_name", "last_name", "email", "phone_number", "username", 
  "hashed_password", "user_type", "date_of_birth",
  "is_paid", "stripe_customer_id", "subscription_status",
  "subscription_start_date", "subscription_end_date", "cancel_at_period_end"
) VALUES
  (
    '110e8400-e29b-41d4-a716-446655440000', 'Demo', 'Student', 'student@email.com', '1231231234', 'studentdemo',
    'Password', 'student', '1995-03-15',
    false, null, 'inactive', null, null, false
  ),
  (
    '110e8400-e29b-41d4-a716-446655440001', 'Demo', 'Teacher', 'teacher@email.com', '5551234567', 'teacherdemo',
    'Password', 'teacher', '1988-07-22',
    false, null, 'inactive', null, null, false
  ),
  (
    '110e8400-e29b-41d4-a716-446655440002', 'Demo', 'Admin', 'admin@email.com', '9998887777', 'admindemo',
    'Password', 'admin', '1980-12-01',
    false, null, 'inactive', null, null, false
  );


-- Insert dummy courses
INSERT INTO "courses" ("id", "teacher_id", "category_id", "title", "description") VALUES
  ('330e8400-e29b-41d4-a716-446655440000', '110e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Poker Fundamentals', 'Learn the basic skills of poker including hand rankings, betting strategies, and table etiquette. Perfect for beginners who want to master the fundamentals of poker.'),
  ('330e8400-e29b-41d4-a716-446655440001', '110e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Basketball Skills Development', 'Comprehensive basketball training focusing on shooting, dribbling, passing, and defensive techniques. Build your skills from the ground up with professional coaching.'),
  ('330e8400-e29b-41d4-a716-446655440002', '110e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Cooking Basics', 'Master essential cooking techniques, knife skills, and recipe fundamentals. Learn to create delicious meals from scratch with confidence.');

-- Insert dummy lessons for each course
-- Lessons for Poker Fundamentals (course_id 330e8400-e29b-41d4-a716-446655440000)
INSERT INTO "lessons" ("id", "teacher_id", "course_id", "title", "description", "video_url") VALUES
  ('440e8400-e29b-41d4-a716-446655440000', '110e8400-e29b-41d4-a716-446655440001', '330e8400-e29b-41d4-a716-446655440000', 'Hand Rankings and Basic Rules', 'Learn the hierarchy of poker hands and fundamental rules of the game to get started playing confidently.', 'https://example.com/poker-basics'),
  ('440e8400-e29b-41d4-a716-446655440001', '110e8400-e29b-41d4-a716-446655440001', '330e8400-e29b-41d4-a716-446655440000', 'Betting Strategies', 'Master basic betting strategies including when to bet, call, raise, or fold based on your hand strength.', 'https://example.com/betting-strategies');

-- Lessons for Basketball Skills Development (course_id 330e8400-e29b-41d4-a716-446655440001)
INSERT INTO "lessons" ("id", "teacher_id", "course_id", "title", "description", "video_url") VALUES
  ('440e8400-e29b-41d4-a716-446655440002', '110e8400-e29b-41d4-a716-446655440001', '330e8400-e29b-41d4-a716-446655440001', 'Shooting Form and Technique', 'Perfect your shooting form with proper hand placement, follow-through, and consistent release. Build muscle memory for accurate shooting.', 'https://example.com/shooting-form'),
  ('440e8400-e29b-41d4-a716-446655440003', '110e8400-e29b-41d4-a716-446655440001', '330e8400-e29b-41d4-a716-446655440001', 'Ball Handling and Dribbling', 'Develop advanced ball handling skills including crossovers, behind-the-back moves, and maintaining control under pressure.', 'https://example.com/ball-handling');

-- Lessons for Cooking Basics (course_id 330e8400-e29b-41d4-a716-446655440002)
INSERT INTO "lessons" ("id", "teacher_id", "course_id", "title", "description", "video_url") VALUES
  ('440e8400-e29b-41d4-a716-446655440004', '110e8400-e29b-41d4-a716-446655440001', '330e8400-e29b-41d4-a716-446655440002', 'Knife Skills and Safety', 'Learn proper knife handling techniques, cutting methods, and safety practices essential for every cook.', 'https://example.com/knife-skills'),
  ('440e8400-e29b-41d4-a716-446655440005', '110e8400-e29b-41d4-a716-446655440001', '330e8400-e29b-41d4-a716-446655440002', 'Basic Cooking Methods', 'Master fundamental cooking techniques including sautéing, roasting, boiling, and grilling to create versatile dishes.', 'https://example.com/cooking-methods');

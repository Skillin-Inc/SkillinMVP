-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

-- STEP 1: Categories must come before teachers
INSERT INTO "categories" ("id", "title") VALUES 
  (1, 'Poker'),
  (2, 'Sports Betting'),
  (3, 'Basketball'),
  (4, 'Pickleball'),
  (5, 'Gaming'),
  (6, 'Cooking'),
  (7, 'Personal Finance'),
  (8, 'Self Care'),
  (9, 'Dating'),
  (10, 'Communication'),
  (11, 'Snowboarding'),
  (12, 'Skiing');

-- STEP 2: Insert users (student, teacher, and admin)
INSERT INTO "users" (
  "first_name", "last_name", "email", "phone_number", "username", 
  "hashed_password", "postal_code","is_paid", "user_type"
) VALUES
  ('Demo', 'Student', 'student@email.com', '1231231234', 'studentdemo', 'Password', 99999, true, 'student'),
  ('Demo', 'Teacher', 'teacher@email.com', '5551234567', 'teacherdemo', 'Password', 99999, true, 'teacher'),
  ('Demo', 'Admin', 'admin@email.com', '9998887777', 'admindemo', 'Password', 99999, true, 'admin');


-- STEP 3: Insert teacher row (after user and categories exist)
INSERT INTO "teachers" ("user_id", "category_id")
SELECT id, 1 FROM "users" WHERE email = 'teacher@email.com';


-- Insert dummy courses
INSERT INTO "courses" ("teacher_id", "category_id", "title", "description") VALUES
  (2, 1, 'Poker Fundamentals', 'Learn the basic skills of poker including hand rankings, betting strategies, and table etiquette. Perfect for beginners who want to master the fundamentals of poker.'),
  (2, 3, 'Basketball Skills Development', 'Comprehensive basketball training focusing on shooting, dribbling, passing, and defensive techniques. Build your skills from the ground up with professional coaching.'),
  (2, 6, 'Cooking Basics', 'Master essential cooking techniques, knife skills, and recipe fundamentals. Learn to create delicious meals from scratch with confidence.');

-- Insert dummy lessons for each course
-- Lessons for Poker Fundamentals (course_id 1)
INSERT INTO "lessons" ("teacher_id", "course_id", "title", "description", "video_url") VALUES
  (2, 1, 'Hand Rankings and Basic Rules', 'Learn the hierarchy of poker hands and fundamental rules of the game to get started playing confidently.', 'https://example.com/poker-basics'),
  (2, 1, 'Betting Strategies', 'Master basic betting strategies including when to bet, call, raise, or fold based on your hand strength.', 'https://example.com/betting-strategies');

-- Lessons for Basketball Skills Development (course_id 2)
INSERT INTO "lessons" ("teacher_id", "course_id", "title", "description", "video_url") VALUES
  (2, 2, 'Shooting Form and Technique', 'Perfect your shooting form with proper hand placement, follow-through, and consistent release. Build muscle memory for accurate shooting.', 'https://example.com/shooting-form'),
  (2, 2, 'Ball Handling and Dribbling', 'Develop advanced ball handling skills including crossovers, behind-the-back moves, and maintaining control under pressure.', 'https://example.com/ball-handling');

-- Lessons for Cooking Basics (course_id 3)
INSERT INTO "lessons" ("teacher_id", "course_id", "title", "description", "video_url") VALUES
  (2, 3, 'Knife Skills and Safety', 'Learn proper knife handling techniques, cutting methods, and safety practices essential for every cook.', 'https://example.com/knife-skills'),
  (2, 3, 'Basic Cooking Methods', 'Master fundamental cooking techniques including sautéing, roasting, boiling, and grilling to create versatile dishes.', 'https://example.com/cooking-methods');

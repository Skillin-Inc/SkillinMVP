-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

-- STEP 1: Categories must come before teachers
INSERT INTO "categories" ("id", "title") VALUES 
  (1, 'Basketball'),
  (2, 'Skiing'),
  (3, 'Soccer'),
  (4, 'Tennis'),
  (5, 'Baseball'),
  (6, 'Snowboarding'),
  (7, 'Poker'),
  (8, 'Football');

-- STEP 2: Insert users (student and teacher)
INSERT INTO "users" (
  "first_name", "last_name", "email", "phone_number", "username", 
  "hashed_password", "postal_code", "user_type"
) VALUES
  ('Demo', 'Student', 'student@email.com', '1231231234', 'studentdemo', 'Password', 99999, 'student'),
  ('Demo', 'Teacher', 'teacher@email.com', '5551234567', 'teacherdemo', 'Password', 99999, 'teacher');

-- STEP 3: Insert teacher row (after user and categories exist)
INSERT INTO "teachers" ("user_id", "category_id")
SELECT id, 1 FROM "users" WHERE email = 'teacher@email.com';


-- Insert dummy courses
INSERT INTO "courses" ("teacher_id", "category_id", "title", "description") VALUES
  (2, 5, 'Baseball Fundamentals', 'Learn the basic skills of baseball including batting, fielding, and base running. Perfect for beginners who want to master the fundamentals of America''s pastime.'),
  (2, 5, 'Advanced Baseball Strategy', 'Dive deep into baseball strategy, situational awareness, and advanced techniques. This course covers game management, pitch selection, and tactical decision making.'),
  (2, 1, 'Basketball Skills Development', 'Comprehensive basketball training focusing on shooting, dribbling, passing, and defensive techniques. Build your skills from the ground up with professional coaching.');

-- Insert dummy lessons for each course
-- Lessons for Baseball Fundamentals (course_id 1)
INSERT INTO "lessons" ("teacher_id", "course_id", "title", "description", "video_url") VALUES
  (2, 1, 'Proper Batting Stance and Swing', 'Learn the correct batting stance, grip, and swing mechanics to improve your hitting consistency and power.', 'https://example.com/batting-basics'),
  (2, 1, 'Fielding Ground Balls', 'Master the fundamentals of fielding ground balls with proper positioning, glove work, and throwing techniques.', 'https://example.com/fielding-groundballs');

-- Lessons for Advanced Baseball Strategy (course_id 2)
INSERT INTO "lessons" ("teacher_id", "course_id", "title", "description", "video_url") VALUES
  (2, 2, 'Reading the Pitcher', 'Advanced techniques for reading pitcher tendencies, recognizing pitch types, and timing your swing for maximum effectiveness.', 'https://example.com/reading-pitcher'),
  (2, 2, 'Situational Hitting', 'Learn how to adapt your hitting approach based on game situations, including hit-and-run, sacrifice situations, and clutch hitting.', 'https://example.com/situational-hitting');

-- Lessons for Basketball Skills Development (course_id 3)
INSERT INTO "lessons" ("teacher_id", "course_id", "title", "description", "video_url") VALUES
  (2, 3, 'Shooting Form and Technique', 'Perfect your shooting form with proper hand placement, follow-through, and consistent release. Build muscle memory for accurate shooting.', 'https://example.com/shooting-form'),
  (2, 3, 'Ball Handling and Dribbling', 'Develop advanced ball handling skills including crossovers, behind-the-back moves, and maintaining control under pressure.', 'https://example.com/ball-handling');

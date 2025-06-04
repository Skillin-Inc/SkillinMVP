-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

-- EXAMPLE:

--  insert into "todos"
--    ("task", "isCompleted")
--    values
--      ('Learn to code', false),
--      ('Build projects', false),
--      ('Get a job', false);

INSERT INTO "users" ("firstName", "lastName", "email", "phoneNumber", "username", "hashedPassword", "postalCode" , "isTeacher")
  VALUES ('Demo', 'Student', 'student@email.com', '1231231234', 'studentdemo', 'Password', 99999, false);

INSERT INTO "users" ("firstName", "lastName", "email", "phoneNumber", "username", "hashedPassword", "postalCode", "isTeacher")
  VALUES ('Demo', 'Teacher', 'teacher@email.com', '5551234567', 'teacherdemo', 'Password', 99999, true);

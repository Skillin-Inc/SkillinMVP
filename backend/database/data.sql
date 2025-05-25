-- Use SQL insert statements to add any
-- starting/dummy data to your database tables

-- EXAMPLE:

--  insert into "todos"
--    ("task", "isCompleted")
--    values
--      ('Learn to code', false),
--      ('Build projects', false),
--      ('Get a job', false);

INSERT INTO "users" ("first_name", "last_name", "email", "phone_number", "username", "hashed_password", "postal_code")
  VALUES ('Henry', 'Pham', 'bob@gmail.com', '1231231234', 'bobbybobby', 'bobbypassword', 99999)

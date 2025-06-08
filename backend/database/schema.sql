SET client_min_messages TO warning;

-- WARNING: REMOVE "DROP SCHEMA" FOR PRODUCTION. This will completely wipe and recreate your database.

DROP SCHEMA "public" CASCADE;

CREATE SCHEMA "public";
-- Maybe Membership Tiers?
-- Create the ENUM type first
--CREATE TYPE membership_tier AS ENUM ('bronze', 'silver', 'gold');
--"membershipTier" membership_tier NOT NULL DEFAULT 'bronze';

CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "phone_number" VARCHAR(15) UNIQUE NOT NULL,
  "username" text UNIQUE NOT NULL,
  "hashed_password" text NOT NULL,
  "postal_code" integer NOT NULL,
  "is_teacher" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz(3) default current_timestamp
);

CREATE TABLE "messages" (
  "id" serial PRIMARY KEY,
  "sender_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "receiver_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "created_at" timestamptz(3) default current_timestamp
);

CREATE TABLE "categories" (
  "id" serial PRIMARY KEY,
  "title" text NOT NULL
);

CREATE TABLE "courses" (
  "id" serial PRIMARY KEY,
  "teacher_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "category_id" integer NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamptz(3) default current_timestamp
);

CREATE TABLE "lessons" (
  "id" serial PRIMARY KEY,
  "teacher_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "course_id" integer NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "video_url" text,
  "created_at" timestamptz(3) default current_timestamp
);

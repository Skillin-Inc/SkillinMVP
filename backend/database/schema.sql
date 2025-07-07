SET client_min_messages TO warning;

-- WARNING: REMOVE "DROP SCHEMA" FOR PRODUCTION. This will completely wipe and recreate your database.

DROP SCHEMA "public" CASCADE;

CREATE SCHEMA "public";

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Maybe Membership Tiers?
-- Create the ENUM type first
--CREATE TYPE membership_tier AS ENUM ('bronze', 'silver', 'gold');
--"membershipTier" membership_tier NOT NULL DEFAULT 'bronze';

-- Create the user_type ENUM
CREATE TYPE user_type AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "phone_number" VARCHAR(15) UNIQUE,
  "username" text UNIQUE NOT NULL,
  "hashed_password" text NOT NULL,
  "is_paid" boolean NOT NULL DEFAULT false,
  "date_of_birth" DATE,
  "user_type" user_type NOT NULL DEFAULT 'student',
  "stripe_customer_id" TEXT,
  "subscription_status" TEXT DEFAULT 'inactive',
  "subscription_start_date" TIMESTAMPTZ,
  "subscription_end_date" TIMESTAMPTZ,
  "cancel_at_period_end" BOOLEAN DEFAULT FALSE,
  "created_at" timestamptz(3) default current_timestamp
);

CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sender_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "receiver_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content" text NOT NULL,
  "is_read" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz(3) default current_timestamp
);

CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" text NOT NULL
);

CREATE TABLE "courses" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "created_at" timestamptz(3) default current_timestamp
);

CREATE TABLE "lessons" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "video_url" text,
  "created_at" timestamptz(3) default current_timestamp
);

CREATE TABLE "progress" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "lesson_id" uuid NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
  "created_at" timestamptz(3) default current_timestamp,
  UNIQUE("user_id", "lesson_id")
);

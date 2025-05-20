SET client_min_messages TO warning;

-- WARNING: REMOVE "DROP SCHEMA" FOR PRODUCTION. This will completely wipe and recreate your database.

DROP SCHEMA "public" CASCADE;

CREATE SCHEMA "public"

CREATE TABLE "users" (
  "userId" serial PRIMARY KEY,
  "firstName" text,
  "lastName" text,
  "email" text,
  "phoneNumber" text,
  "username" text,
  "hashedPassword" text,
  "postalCode" integer,
  "createdAt" timestamptz
);

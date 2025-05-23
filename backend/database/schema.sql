SET client_min_messages TO warning;

-- WARNING: REMOVE "DROP SCHEMA" FOR PRODUCTION. This will completely wipe and recreate your database.

DROP SCHEMA "public" CASCADE;

CREATE SCHEMA "public";

CREATE TABLE "users" (
  "userId" serial PRIMARY KEY,
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "phoneNumber" VARCHAR(15) UNIQUE NOT NULL,
  "username" text UNIQUE NOT NULL,
  "hashedPassword" text NOT NULL,
  "postalCode" integer NOT NULL,
  "createdAt" timestamptz(3) default current_timestamp
);

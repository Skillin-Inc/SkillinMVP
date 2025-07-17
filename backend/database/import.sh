#!/bin/sh

set -e

wd=`echo "$PWD" | sed 's/\/backend$//'`/backend

if [ -f "$wd"/../backend/.env ]; then
  . "$wd"/../backend/.env
else
  echo 'no .env file found at ' "$wd"/../backend/.env 1>&2
  exit 1
fi

if [ -n "$DATABASE_URL" ]; then
  # Import schema only - data insertion now handled by setup-database.ts
  psql "$DATABASE_URL" \
    -f "$wd"/database/schema.sql
  echo "Schema imported. Run 'npm run setup-db' to populate with data and sync Cognito users."
else
  echo 'no DATABASE_URL environment variable set' 1>&2
  exit 1
fi

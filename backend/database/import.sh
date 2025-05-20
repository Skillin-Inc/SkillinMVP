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
  psql "$DATABASE_URL" \
    -f "$wd"/database/schema.sql \
    -f "$wd"/database/data.sql
else
  echo 'no DATABASE_URL environment variable set' 1>&2
  exit 1
fi

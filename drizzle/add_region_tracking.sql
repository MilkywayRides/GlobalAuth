-- Add region tracking columns to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "country" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "region" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "city" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" text;

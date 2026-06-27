-- Migration: TM-Kurs Buchungsflow (#106)
-- Run this in the Supabase SQL Editor

-- 1. Add course-booking columns to tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS show_courses boolean NOT NULL DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS course_locales text[] NOT NULL DEFAULT '{de}';

-- 2. Create kurs_anmeldungen backup table
CREATE TABLE IF NOT EXISTS kurs_anmeldungen (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant           text NOT NULL,
  slot_pk          integer NOT NULL,
  tmw_booking_id   integer,
  first_name       text NOT NULL,
  last_name        text NOT NULL,
  email            text NOT NULL,
  phone            text,
  gender           text NOT NULL,
  birthdate        text NOT NULL,
  address1         text,
  zip_code         text,
  city             text,
  news_subscribed  boolean NOT NULL DEFAULT false,
  locale           text NOT NULL,
  source           text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

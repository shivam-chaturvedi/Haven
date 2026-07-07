-- 04_add_bio.sql

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Migration: Add email to profiles
-- Description: Add email column to profiles table and index it for lookups
-- Created: 2026-02-11

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

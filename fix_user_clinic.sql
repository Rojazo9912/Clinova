-- Fix: Assign clinic to user profile
-- Run this in Supabase SQL Editor

-- First, let's see what we have
SELECT id, email FROM auth.users LIMIT 5;

-- Check profiles
SELECT id, email, clinic_id, role FROM profiles LIMIT 5;

-- Check clinics
SELECT id, name FROM clinics LIMIT 5;

-- If you see a user without clinic_id, update it:
-- Replace 'YOUR_USER_EMAIL' with your actual email
-- Replace 'YOUR_CLINIC_ID' with the clinic ID from the clinics table

UPDATE profiles
SET clinic_id = (SELECT id FROM clinics LIMIT 1)
WHERE email = 'miguel_lopez_ortiz@desarrollosrod.com'
AND clinic_id IS NULL;

-- Verify the fix
SELECT id, email, clinic_id, role FROM profiles 
WHERE email = 'miguel_lopez_ortiz@desarrollosrod.com';

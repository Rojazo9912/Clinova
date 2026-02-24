-- 1. DROP ALL EXISTING POLICIES on Profiles & Medical Records to be sure
DROP POLICY IF EXISTS "Clinic members can view profiles from same clinic" ON public.profiles;
DROP POLICY IF EXISTS "Clinic members and Super Admins view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles; -- Just in case

DROP POLICY IF EXISTS "Clinic members can view records from same clinic" ON public.medical_records;
DROP POLICY IF EXISTS "Clinic members view records" ON public.medical_records;
DROP POLICY IF EXISTS "Staff insert records" ON public.medical_records;
DROP POLICY IF EXISTS "Staff update records" ON public.medical_records;
DROP POLICY IF EXISTS "Physios and Admins can insert records" ON public.medical_records;
DROP POLICY IF EXISTS "Physios and Admins can update records" ON public.medical_records;

-- 2. Redefine Functions ensuring they are SECURITY DEFINER
-- This means they run with the privileges of the creator (postgres/admin), bypassing RLS
CREATE OR REPLACE FUNCTION public.get_my_clinic_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT clinic_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- 3. PROFILES POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SIMPLEST POLICY: You can see yourself.
CREATE POLICY "View own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- COMPLEX POLICY: You can see others in your clinic OR if you are super admin
-- NOTE: We separate this to avoid confusion if possible, or combine carefully.
CREATE POLICY "View clinic members and admin view all"
ON public.profiles FOR SELECT
USING (
  (clinic_id = get_my_clinic_id()) 
  OR 
  (get_my_role() = 'super_admin')
);

-- Note: No INSERT policy needed usually as triggers handle it, or authenticated users can insert their own if we allow signup.
-- Allowing users to update their own profile (e.g. name)
CREATE POLICY "Update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

-- 4. MEDICAL RECORDS POLICIES
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View records for clinic"
ON public.medical_records FOR SELECT
USING (
  clinic_id = get_my_clinic_id() OR get_my_role() = 'super_admin'
);

CREATE POLICY "Insert records for staff"
ON public.medical_records FOR INSERT
WITH CHECK (
  clinic_id = get_my_clinic_id()
  AND 
  get_my_role() IN ('clinic_manager', 'physio', 'super_admin')
);

CREATE POLICY "Update records for staff"
ON public.medical_records FOR UPDATE
USING (
  clinic_id = get_my_clinic_id()
  AND 
  get_my_role() IN ('clinic_manager', 'physio', 'super_admin')
);


-- 5. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.medical_records TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_clinic_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role TO authenticated;

-- 1. Create helper functions to safely read current user data without RLS recursion
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

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Clinic members can view profiles from same clinic" ON public.profiles;
DROP POLICY IF EXISTS "Clinic members can view records from same clinic" ON public.medical_records;
DROP POLICY IF EXISTS "Physios and Admins can insert records" ON public.medical_records;
DROP POLICY IF EXISTS "Physios and Admins can update records" ON public.medical_records;

-- 3. Re-create policies using the safe functions

-- Profiles: Clinic Match OR Super Admin
CREATE POLICY "Clinic members and Super Admins view profiles"
ON public.profiles FOR SELECT
USING (
  (clinic_id = get_my_clinic_id())
  OR
  (get_my_role() = 'super_admin')
  OR
  (auth.uid() = id) -- Always see own profile
);

-- Medical Records: Clinic Match
CREATE POLICY "Clinic members view records"
ON public.medical_records FOR SELECT
USING (
  clinic_id = get_my_clinic_id()
  OR
  get_my_role() = 'super_admin'
);

CREATE POLICY "Staff insert records"
ON public.medical_records FOR INSERT
WITH CHECK (
  clinic_id = get_my_clinic_id()
  AND
  get_my_role() IN ('clinic_manager', 'physio', 'super_admin')
);

CREATE POLICY "Staff update records"
ON public.medical_records FOR UPDATE
USING (
  clinic_id = get_my_clinic_id()
  AND
  get_my_role() IN ('clinic_manager', 'physio', 'super_admin')
);

-- 4. Policies for Clinics Table (If not already secure)
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view their own clinic"
ON public.clinics FOR SELECT
USING (
  id = get_my_clinic_id()
  OR
  get_my_role() = 'super_admin'
);

CREATE POLICY "Super Admins can insert clinics"
ON public.clinics FOR INSERT
WITH CHECK (
  get_my_role() = 'super_admin'
);

CREATE POLICY "Super Admins can update clinics"
ON public.clinics FOR UPDATE
USING (
  get_my_role() = 'super_admin'
);

-- 5. Grant access to Authenticated users for the functions
GRANT EXECUTE ON FUNCTION public.get_my_clinic_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role TO authenticated;

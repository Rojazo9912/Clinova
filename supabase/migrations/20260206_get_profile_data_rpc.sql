CREATE OR REPLACE FUNCTION public.get_my_profile_data()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT json_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'role', p.role,
    'clinic_id', p.clinic_id,
    'clinics', (SELECT json_build_object('name', c.name) FROM clinics c WHERE c.id = p.clinic_id)
  )
  FROM profiles p
  WHERE p.id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_profile_data TO authenticated;

-- 1. Create PROFILES table (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  clinic_id uuid references public.clinics(id),
  role text check (role in ('super_admin', 'clinic_manager', 'physio', 'patient')),
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Clinic members can view profiles from same clinic" 
on public.profiles for select 
using (
  clinic_id = (select clinic_id from public.profiles where id = auth.uid())
);

-- 2. Create MEDICAL_RECORDS table (EMR)
create table if not exists public.medical_records (
  id uuid default gen_random_uuid() primary key,
  clinic_id uuid references public.clinics(id) not null,
  patient_id uuid references public.patients(id) not null,
  doctor_id uuid references public.profiles(id), -- The physio who created it
  diagnosis text,
  treatment_plan text,
  notes text,
  attachments jsonb default '[]'::jsonb, -- Store array of file URLs
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on medical_records
alter table public.medical_records enable row level security;

-- Policies for medical_records
create policy "Clinic members can view records from same clinic" 
on public.medical_records for select 
using (
  clinic_id = (select clinic_id from public.profiles where id = auth.uid())
);

create policy "Physios and Admins can insert records" 
on public.medical_records for insert 
with check (
  clinic_id = (select clinic_id from public.profiles where id = auth.uid())
  and 
  (select role from public.profiles where id = auth.uid()) in ('clinic_manager', 'physio', 'super_admin')
);

create policy "Physios and Admins can update records" 
on public.medical_records for update 
using (
  clinic_id = (select clinic_id from public.profiles where id = auth.uid())
  and 
  (select role from public.profiles where id = auth.uid()) in ('clinic_manager', 'physio', 'super_admin')
);

-- 3. Automatic Profile Creation Trigger (Optional but recommended)
-- This assumes public.clinics has a default or you handle assignment manually. 
-- For now, we will just create the function, user might need to attach it manually depending on flow.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'patient'); 
  -- Note: Clinic assignment usually happens via invitation or specific signup flow.
  -- Defaulting to 'patient' and no clinic for now.
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition (Uncomment if you want auto-creation on signup)
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

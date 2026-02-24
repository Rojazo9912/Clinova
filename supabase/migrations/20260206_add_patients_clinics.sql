-- Create CLINICS table if not exists (Tenant)
create table if not exists public.clinics (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  stripe_customer_id text,
  subscription_status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on clinics
alter table public.clinics enable row level security;

-- Create PATIENTS table
create table if not exists public.patients (
  id uuid default gen_random_uuid() primary key,
  clinic_id uuid references public.clinics(id) not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  birth_date date,
  gender text,
  address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on patients
alter table public.patients enable row level security;

-- Policies for patients
create policy "Clinic members can view patients from same clinic" 
on public.patients for select 
using (
  clinic_id = (select clinic_id from public.profiles where id = auth.uid())
);

create policy "Clinic members can insert patients" 
on public.patients for insert 
with check (
  clinic_id = (select clinic_id from public.profiles where id = auth.uid())
);

create policy "Clinic members can update patients" 
on public.patients for update 
using (
  clinic_id = (select clinic_id from public.profiles where id = auth.uid())
);

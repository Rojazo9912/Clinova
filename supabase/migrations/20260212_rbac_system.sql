-- 1. Create ROLES table
create table if not exists public.roles (
  code text primary key,
  name text not null,
  permissions jsonb default '[]'::jsonb,
  is_system boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.roles enable row level security;

-- 3. RLS Policies
-- Everyone can view roles (needed for login/profile checks)
create policy "Everyone can view roles" 
on public.roles for select 
using (true);

-- Only Super Admin can manage roles
create policy "Super Admin can insert roles" 
on public.roles for insert 
with check (
  (select role from public.profiles where id = auth.uid()) = 'super_admin'
);

create policy "Super Admin can update roles" 
on public.roles for update 
using (
  (select role from public.profiles where id = auth.uid()) = 'super_admin'
);

create policy "Super Admin can delete roles" 
on public.roles for delete 
using (
  (select role from public.profiles where id = auth.uid()) = 'super_admin' 
  and is_system = false
);

-- 4. Seed Default Roles
insert into public.roles (code, name, permissions, is_system) values
('super_admin', 'Super Administrador', '["*"]', true),
('clinic_manager', 'Gerente de Clínica', '["view_dashboard", "manage_users", "manage_finance", "view_reports", "view_agenda", "manage_agenda", "view_patients", "manage_patients"]', true),
('physio', 'Fisioterapeuta', '["view_dashboard", "view_agenda", "manage_agenda", "view_patients", "manage_emr"]', true),
('patient', 'Paciente', '["view_portal"]', true),
('staff', 'Personal', '["view_dashboard", "view_agenda"]', true)
on conflict (code) do nothing;

-- 5. Update PROFILES table to reference ROLES
-- First, ensure existing data is valid (we are adding 'staff' above just in case)
-- Now drop the check constraint
alter table public.profiles drop constraint if exists profiles_role_check;

-- Add Foreign Key
alter table public.profiles 
add constraint profiles_role_fkey 
foreign key (role) 
references public.roles(code) 
on update cascade;

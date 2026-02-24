-- Tabla de servicios/tratamientos
CREATE TABLE IF NOT EXISTS public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  duration_minutes integer,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) NOT NULL,
  patient_id uuid REFERENCES public.patients(id) NOT NULL,
  appointment_id uuid REFERENCES public.appointments(id),
  service_id uuid REFERENCES public.services(id),
  amount numeric(10,2) NOT NULL,
  payment_method text CHECK (payment_method IN ('cash', 'card', 'transfer', 'other')),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS para services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members can view services from same clinic"
ON public.services FOR SELECT
USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Managers can manage services"
ON public.services FOR ALL
USING (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('clinic_manager', 'super_admin')
);

-- RLS para payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members can view payments from same clinic"
ON public.payments FOR SELECT
USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can insert payments"
ON public.payments FOR INSERT
WITH CHECK (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('clinic_manager', 'staff', 'super_admin')
);

CREATE POLICY "Staff can update payments"
ON public.payments FOR UPDATE
USING (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('clinic_manager', 'staff', 'super_admin')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_services_clinic ON public.services(clinic_id);
CREATE INDEX IF NOT EXISTS idx_payments_clinic ON public.payments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(created_at);

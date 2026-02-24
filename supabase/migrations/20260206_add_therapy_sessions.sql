-- Tabla de sesiones de terapia
CREATE TABLE IF NOT EXISTS public.therapy_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid REFERENCES public.clinics(id) NOT NULL,
  patient_id uuid REFERENCES public.patients(id) NOT NULL,
  physio_id uuid REFERENCES public.profiles(id) NOT NULL,
  appointment_id uuid REFERENCES public.appointments(id),
  session_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  notes text,
  exercises jsonb DEFAULT '[]'::jsonb,
  progress_rating integer CHECK (progress_rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic members can view sessions from same clinic"
ON public.therapy_sessions FOR SELECT
USING (clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Physios can insert sessions"
ON public.therapy_sessions FOR INSERT
WITH CHECK (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('physio', 'clinic_manager', 'super_admin')
);

CREATE POLICY "Physios can update their sessions"
ON public.therapy_sessions FOR UPDATE
USING (
  clinic_id = (SELECT clinic_id FROM public.profiles WHERE id = auth.uid())
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('physio', 'clinic_manager', 'super_admin')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_patient ON public.therapy_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_physio ON public.therapy_sessions(physio_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_date ON public.therapy_sessions(session_date);

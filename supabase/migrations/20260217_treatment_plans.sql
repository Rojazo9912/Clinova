-- Migration: Treatment Plans & Session Packages
-- Description: Structured treatment plans with session tracking, goals, and packages

-- Treatment plans table
CREATE TABLE IF NOT EXISTS treatment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    physio_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Plan info
    title VARCHAR(200) NOT NULL, -- e.g. "Rehabilitación Lumbar"
    diagnosis TEXT, -- Clinical diagnosis
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'

    -- Session package
    total_sessions INTEGER NOT NULL DEFAULT 1, -- Total sessions in the package
    completed_sessions INTEGER DEFAULT 0, -- Sessions completed so far
    frequency VARCHAR(50), -- '2x_semana', '3x_semana', 'diario', 'semanal'

    -- Financials
    package_price NUMERIC(10,2), -- Total price for the package
    session_price NUMERIC(10,2), -- Price per individual session (if not package)
    paid_amount NUMERIC(10,2) DEFAULT 0, -- Amount paid so far

    -- Dates
    start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,

    -- Clinical goals (structured)
    goals JSONB DEFAULT '[]', -- [{id, description, target_value, metric, achieved, achieved_at}]

    -- Discharge
    discharge_notes TEXT,
    discharge_reason VARCHAR(50), -- 'completed', 'patient_request', 'no_improvement', 'referred', 'other'

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link therapy sessions to treatment plans
ALTER TABLE therapy_sessions
ADD COLUMN IF NOT EXISTS treatment_plan_id UUID REFERENCES treatment_plans(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_clinic ON treatment_plans(clinic_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_status ON treatment_plans(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_plan ON therapy_sessions(treatment_plan_id);

-- RLS Policies
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

-- Staff can view plans from their clinic
CREATE POLICY "Staff can view clinic treatment plans"
ON treatment_plans
FOR SELECT
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
);

-- Staff can create plans
CREATE POLICY "Staff can create treatment plans"
ON treatment_plans
FOR INSERT
WITH CHECK (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
);

-- Staff can update plans from their clinic
CREATE POLICY "Staff can update clinic treatment plans"
ON treatment_plans
FOR UPDATE
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
);

-- Staff can delete plans they created
CREATE POLICY "Staff can delete own treatment plans"
ON treatment_plans
FOR DELETE
USING (
    created_by = auth.uid()
);

-- Patients can view their own plans via portal
CREATE POLICY "Patients can view own treatment plans"
ON treatment_plans
FOR SELECT
USING (
    patient_id IN (
        SELECT patient_id FROM patient_users WHERE user_id = auth.uid()
    )
);

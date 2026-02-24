-- Migration: Clinical Measurements & Assessment Scales
-- Description: Create clinical_measurements table for tracking patient evolution
-- with EVA pain scale, ROM, strength, standardized questionnaires

-- Clinical measurements table
CREATE TABLE IF NOT EXISTS clinical_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id UUID REFERENCES therapy_sessions(id) ON DELETE SET NULL,

    -- Metric type
    metric VARCHAR(50) NOT NULL, -- 'dolor', 'movilidad', 'fuerza', 'flexibilidad', 'body_map', 'rom', 'questionnaire'

    -- Numeric value (0-10 scale for EVA, degrees for ROM, etc.)
    value NUMERIC,

    -- Structured data (body map points, ROM per joint, questionnaire answers)
    data JSONB,

    -- Context
    body_region VARCHAR(50), -- 'cervical', 'lumbar', 'hombro_derecho', 'rodilla_izquierda', etc.
    notes TEXT,

    measured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinical_measurements_patient ON clinical_measurements(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_measurements_metric ON clinical_measurements(patient_id, metric);
CREATE INDEX IF NOT EXISTS idx_clinical_measurements_date ON clinical_measurements(patient_id, measured_at);
CREATE INDEX IF NOT EXISTS idx_clinical_measurements_session ON clinical_measurements(session_id);
CREATE INDEX IF NOT EXISTS idx_clinical_measurements_region ON clinical_measurements(patient_id, body_region);

-- RLS Policies
ALTER TABLE clinical_measurements ENABLE ROW LEVEL SECURITY;

-- Staff can view measurements from their clinic
CREATE POLICY "Staff can view clinic measurements"
ON clinical_measurements
FOR SELECT
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
);

-- Staff can create measurements
CREATE POLICY "Staff can create measurements"
ON clinical_measurements
FOR INSERT
WITH CHECK (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
);

-- Staff can update measurements they created
CREATE POLICY "Staff can update own measurements"
ON clinical_measurements
FOR UPDATE
USING (
    created_by = auth.uid()
);

-- Staff can delete measurements they created
CREATE POLICY "Staff can delete own measurements"
ON clinical_measurements
FOR DELETE
USING (
    created_by = auth.uid()
);

-- Patients can view their own measurements via portal
CREATE POLICY "Patients can view own measurements"
ON clinical_measurements
FOR SELECT
USING (
    patient_id IN (
        SELECT patient_id FROM patient_users WHERE user_id = auth.uid()
    )
);

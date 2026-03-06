-- Migration: Fix clinical_measurements missing columns
-- Adds clinic_id and body_region if the table was created without them

ALTER TABLE clinical_measurements
    ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS body_region VARCHAR(50);

-- Index for body_region queries
CREATE INDEX IF NOT EXISTS idx_clinical_measurements_region
    ON clinical_measurements(patient_id, body_region);

-- Migration: Create patient portal infrastructure
-- Description: Creates patient_users table and RLS policies for patient portal access

-- Create patient_users table to link auth users with patients
CREATE TABLE IF NOT EXISTS patient_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES profiles(id),
    first_login_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(patient_id)
);

-- Enable RLS
ALTER TABLE patient_users ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can manage patient users
CREATE POLICY "Staff can manage patient users"
ON patient_users
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'physiotherapist', 'receptionist')
    )
);

-- Policy: Patients can view their own user record
CREATE POLICY "Patients can view own user record"
ON patient_users
FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies for patient data access

-- Appointments: Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
ON appointments
FOR SELECT
USING (
    patient_id IN (
        SELECT patient_id FROM patient_users 
        WHERE user_id = auth.uid()
        AND is_active = TRUE
    )
);

-- Therapy Sessions: Patients can view their own sessions
CREATE POLICY "Patients can view own therapy sessions"
ON therapy_sessions
FOR SELECT
USING (
    patient_id IN (
        SELECT patient_id FROM patient_users 
        WHERE user_id = auth.uid()
        AND is_active = TRUE
    )
);

-- Payments: Patients can view their own payments
CREATE POLICY "Patients can view own payments"
ON payments
FOR SELECT
USING (
    patient_id IN (
        SELECT patient_id FROM patient_users 
        WHERE user_id = auth.uid()
        AND is_active = TRUE
    )
);

-- Patients: Patients can view their own profile
CREATE POLICY "Patients can view own profile"
ON patients
FOR SELECT
USING (
    id IN (
        SELECT patient_id FROM patient_users 
        WHERE user_id = auth.uid()
        AND is_active = TRUE
    )
);

-- Patients: Patients can update their own contact info
CREATE POLICY "Patients can update own contact info"
ON patients
FOR UPDATE
USING (
    id IN (
        SELECT patient_id FROM patient_users 
        WHERE user_id = auth.uid()
        AND is_active = TRUE
    )
)
WITH CHECK (
    id IN (
        SELECT patient_id FROM patient_users 
        WHERE user_id = auth.uid()
        AND is_active = TRUE
    )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_patient_users_user_id ON patient_users(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_users_patient_id ON patient_users(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_users_active ON patient_users(is_active) WHERE is_active = TRUE;

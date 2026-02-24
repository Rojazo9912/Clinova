-- Migration: Exercise Library
-- Description: Add exercise library with patient assignments

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Classification
    category VARCHAR(50) NOT NULL, -- 'mobility', 'strength', 'stretching', 'balance', 'breathing', 'functional'
    difficulty VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    
    -- Exercise details
    duration_minutes INTEGER,
    repetitions VARCHAR(50), -- e.g., "10-15", "Hold 30 seconds"
    sets INTEGER,
    
    -- Media
    image_url TEXT,
    video_url TEXT,
    
    -- Sharing
    is_shared BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient exercise assignments
CREATE TABLE IF NOT EXISTS patient_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Assignment details
    assigned_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT, -- Specific notes for this patient
    frequency VARCHAR(50), -- 'daily', '3x_week', '2x_day', etc.
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused'
    completed_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(patient_id, exercise_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exercises_clinic ON exercises(clinic_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(clinic_id, category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_patient_exercises_patient ON patient_exercises(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_exercises_exercise ON patient_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_patient_exercises_status ON patient_exercises(patient_id, status);

-- RLS Policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_exercises ENABLE ROW LEVEL SECURITY;

-- Staff can view shared exercises or their own
CREATE POLICY "Staff can view clinic exercises"
ON exercises
FOR SELECT
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
    AND (is_shared = TRUE OR created_by = auth.uid())
);

-- Staff can create exercises
CREATE POLICY "Staff can create exercises"
ON exercises
FOR INSERT
WITH CHECK (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
);

-- Staff can update their own exercises
CREATE POLICY "Staff can update own exercises"
ON exercises
FOR UPDATE
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
);

-- Staff can delete their own exercises
CREATE POLICY "Staff can delete own exercises"
ON exercises
FOR DELETE
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
);

-- Staff can view patient exercises from their clinic
CREATE POLICY "Staff can view clinic patient exercises"
ON patient_exercises
FOR SELECT
USING (
    patient_id IN (
        SELECT p.id FROM patients p
        INNER JOIN profiles pr ON pr.clinic_id = p.clinic_id
        WHERE pr.id = auth.uid()
    )
);

-- Staff can assign exercises
CREATE POLICY "Staff can assign exercises"
ON patient_exercises
FOR INSERT
WITH CHECK (
    patient_id IN (
        SELECT p.id FROM patients p
        INNER JOIN profiles pr ON pr.clinic_id = p.clinic_id
        WHERE pr.id = auth.uid()
    )
    AND assigned_by = auth.uid()
);

-- Staff can update assignments
CREATE POLICY "Staff can update assignments"
ON patient_exercises
FOR UPDATE
USING (
    patient_id IN (
        SELECT p.id FROM patients p
        INNER JOIN profiles pr ON pr.clinic_id = p.clinic_id
        WHERE pr.id = auth.uid()
    )
);

-- Staff can delete assignments
CREATE POLICY "Staff can delete assignments"
ON patient_exercises
FOR DELETE
USING (
    patient_id IN (
        SELECT p.id FROM patients p
        INNER JOIN profiles pr ON pr.clinic_id = p.clinic_id
        WHERE pr.id = auth.uid()
    )
);

-- Patients can view their own assigned exercises
CREATE POLICY "Patients can view own exercises"
ON patient_exercises
FOR SELECT
USING (
    patient_id IN (
        SELECT patient_id FROM patient_users WHERE user_id = auth.uid()
    )
);

-- Patients can update status of their exercises
CREATE POLICY "Patients can update own exercise status"
ON patient_exercises
FOR UPDATE
USING (
    patient_id IN (
        SELECT patient_id FROM patient_users WHERE user_id = auth.uid()
    )
);

-- Insert sample exercises
INSERT INTO exercises (clinic_id, name, description, category, difficulty, duration_minutes, repetitions, sets, is_shared, created_by)
SELECT 
    c.id,
    'Estiramiento de Cuádriceps',
    E'1. De pie, apóyate en una pared con una mano\n2. Dobla la rodilla y lleva el talón hacia el glúteo\n3. Sostén el tobillo con la mano libre\n4. Mantén la posición durante 30 segundos\n5. Siente el estiramiento en la parte frontal del muslo\n6. Repite con la otra pierna\n\nPRECAUCIONES:\n- No fuerces el estiramiento\n- Mantén la espalda recta\n- Si sientes dolor, reduce la intensidad',
    'stretching',
    'beginner',
    2,
    '3 por pierna',
    2,
    TRUE,
    (SELECT id FROM profiles WHERE clinic_id = c.id LIMIT 1)
FROM clinics c
ON CONFLICT DO NOTHING;

INSERT INTO exercises (clinic_id, name, description, category, difficulty, duration_minutes, repetitions, sets, is_shared, created_by)
SELECT 
    c.id,
    'Sentadillas',
    E'1. Párate con los pies al ancho de los hombros\n2. Baja lentamente doblando las rodillas\n3. Mantén la espalda recta y el pecho hacia arriba\n4. Baja hasta que los muslos estén paralelos al suelo\n5. Empuja con los talones para volver a la posición inicial\n\nPRECAUCIONES:\n- Las rodillas no deben sobrepasar las puntas de los pies\n- Mantén el core activado\n- Respira de forma controlada',
    'strength',
    'intermediate',
    5,
    '12-15',
    3,
    TRUE,
    (SELECT id FROM profiles WHERE clinic_id = c.id LIMIT 1)
FROM clinics c
ON CONFLICT DO NOTHING;

INSERT INTO exercises (clinic_id, name, description, category, difficulty, duration_minutes, repetitions, sets, is_shared, created_by)
SELECT 
    c.id,
    'Rotación de Hombros',
    E'1. Siéntate o párate con la espalda recta\n2. Relaja los brazos a los lados\n3. Levanta los hombros hacia las orejas\n4. Rota los hombros hacia atrás en círculos amplios\n5. Completa 10 rotaciones hacia atrás\n6. Repite 10 rotaciones hacia adelante\n\nBENEFICIOS:\n- Mejora la movilidad del hombro\n- Reduce la tensión\n- Previene lesiones',
    'mobility',
    'beginner',
    3,
    '10 en cada dirección',
    2,
    TRUE,
    (SELECT id FROM profiles WHERE clinic_id = c.id LIMIT 1)
FROM clinics c
ON CONFLICT DO NOTHING;

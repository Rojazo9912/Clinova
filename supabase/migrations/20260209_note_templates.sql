-- Migration: Medical Note Templates
-- Description: Add note templates system for faster documentation

-- Note templates table
CREATE TABLE IF NOT EXISTS note_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'diagnosis', 'treatment', 'progress', 'general'
    content TEXT NOT NULL,
    
    -- Variables used in template (for UI hints)
    variables_used TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Sharing
    is_shared BOOLEAN DEFAULT TRUE, -- Shared with clinic team
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_note_templates_clinic ON note_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_note_templates_category ON note_templates(clinic_id, category);
CREATE INDEX IF NOT EXISTS idx_note_templates_created_by ON note_templates(created_by);

-- RLS Policies
ALTER TABLE note_templates ENABLE ROW LEVEL SECURITY;

-- Staff can view shared templates or their own templates
CREATE POLICY "Staff can view clinic templates"
ON note_templates
FOR SELECT
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
    AND (is_shared = TRUE OR created_by = auth.uid())
);

-- Staff can create templates
CREATE POLICY "Staff can create templates"
ON note_templates
FOR INSERT
WITH CHECK (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
);

-- Staff can update their own templates or shared templates if they're admin
CREATE POLICY "Staff can update own templates"
ON note_templates
FOR UPDATE
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
);

-- Staff can delete their own templates
CREATE POLICY "Staff can delete own templates"
ON note_templates
FOR DELETE
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
);

-- Insert some default templates
INSERT INTO note_templates (clinic_id, name, category, content, variables_used, is_shared, created_by)
SELECT 
    c.id,
    'Evaluación Inicial',
    'diagnosis',
    'Paciente: {patient_name}, {patient_age} años
Fecha: {date}
Servicio: {service}
Terapeuta: {therapist_name}

EVALUACIÓN INICIAL:
- Motivo de consulta: 
- Antecedentes relevantes: 
- Inspección visual:
- Palpación:
- Pruebas funcionales:
- Rango de movimiento:

DIAGNÓSTICO FISIOTERAPÉUTICO:


PLAN DE TRATAMIENTO:
- Objetivos a corto plazo:
- Objetivos a largo plazo:
- Técnicas a aplicar:
- Frecuencia recomendada:
- Recomendaciones al paciente:',
    ARRAY['patient_name', 'patient_age', 'date', 'service', 'therapist_name'],
    TRUE,
    (SELECT id FROM profiles WHERE clinic_id = c.id LIMIT 1)
FROM clinics c
ON CONFLICT DO NOTHING;

INSERT INTO note_templates (clinic_id, name, category, content, variables_used, is_shared, created_by)
SELECT 
    c.id,
    'Nota de Evolución',
    'progress',
    'Paciente: {patient_name}
Fecha: {date}
Sesión #{session_number}
Terapeuta: {therapist_name}

EVOLUCIÓN:
- Estado del paciente:
- Respuesta al tratamiento:
- Cambios observados:

TRATAMIENTO APLICADO:
- Técnicas utilizadas:
- Duración:
- Intensidad:

OBSERVACIONES:


PLAN PARA PRÓXIMA SESIÓN:',
    ARRAY['patient_name', 'date', 'session_number', 'therapist_name'],
    TRUE,
    (SELECT id FROM profiles WHERE clinic_id = c.id LIMIT 1)
FROM clinics c
ON CONFLICT DO NOTHING;

INSERT INTO note_templates (clinic_id, name, category, content, variables_used, is_shared, created_by)
SELECT 
    c.id,
    'Plan de Tratamiento',
    'treatment',
    'PLAN DE TRATAMIENTO

Paciente: {patient_name}, {patient_age} años
Servicio: {service}
Fecha de inicio: {date}

DIAGNÓSTICO:


OBJETIVOS DEL TRATAMIENTO:
1. 
2. 
3. 

PROTOCOLO DE INTERVENCIÓN:
- Fase 1 (Semanas 1-2):
  
- Fase 2 (Semanas 3-4):
  
- Fase 3 (Semanas 5+):
  

FRECUENCIA: 

DURACIÓN ESTIMADA:

CRITERIOS DE ALTA:


RECOMENDACIONES AL PACIENTE:',
    ARRAY['patient_name', 'patient_age', 'service', 'date'],
    TRUE,
    (SELECT id FROM profiles WHERE clinic_id = c.id LIMIT 1)
FROM clinics c
ON CONFLICT DO NOTHING;

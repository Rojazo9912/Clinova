-- Migration: Enhanced reminder system
-- Description: Add configurable reminder settings, templates, and logging

-- Reminder settings per clinic
CREATE TABLE IF NOT EXISTS reminder_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Reminder times (hours before appointment)
    reminder_times INTEGER[] DEFAULT ARRAY[24], -- e.g., [48, 24, 2]
    
    -- Send window (to avoid sending at night)
    send_start_hour INTEGER DEFAULT 9, -- 9 AM
    send_end_hour INTEGER DEFAULT 20, -- 8 PM
    
    -- Enable/disable
    whatsapp_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(clinic_id)
);

-- Message templates
CREATE TABLE IF NOT EXISTS reminder_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    
    template_type VARCHAR(50) NOT NULL, -- 'whatsapp_reminder', 'email_reminder', etc.
    
    -- Template content with variables: {patient_name}, {date}, {time}, {service}, {clinic_name}
    subject TEXT, -- For emails
    message TEXT NOT NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(clinic_id, template_type)
);

-- Reminder logs for tracking
CREATE TABLE IF NOT EXISTS reminder_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    
    reminder_type VARCHAR(20) NOT NULL, -- 'whatsapp', 'email'
    hours_before INTEGER NOT NULL, -- 48, 24, 2, etc.
    
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'skipped'
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add reminders_enabled to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN DEFAULT TRUE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reminder_settings_clinic ON reminder_settings(clinic_id);
CREATE INDEX IF NOT EXISTS idx_reminder_templates_clinic ON reminder_templates(clinic_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_appointment ON reminder_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_sent_at ON reminder_logs(sent_at);

-- RLS Policies
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- Staff can manage their clinic's settings
CREATE POLICY "Staff can manage clinic reminder settings"
ON reminder_settings
FOR ALL
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Staff can manage clinic reminder templates"
ON reminder_templates
FOR ALL
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Staff can view clinic reminder logs"
ON reminder_logs
FOR SELECT
USING (
    clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
);

-- Insert default settings for existing clinics
INSERT INTO reminder_settings (clinic_id, reminder_times, send_start_hour, send_end_hour)
SELECT id, ARRAY[24], 9, 20
FROM clinics
ON CONFLICT (clinic_id) DO NOTHING;

-- Insert default templates
INSERT INTO reminder_templates (clinic_id, template_type, message)
SELECT 
    id,
    'whatsapp_reminder',
    'Hola {patient_name}! 👋

Te recordamos tu cita en {clinic_name}:
📅 {date}
🕐 {time}
💆 {service}

¿Necesitas reagendar? Contáctanos.

¡Te esperamos!'
FROM clinics
ON CONFLICT (clinic_id, template_type) DO NOTHING;

INSERT INTO reminder_templates (clinic_id, template_type, subject, message)
SELECT 
    id,
    'email_reminder',
    'Recordatorio de Cita - {clinic_name}',
    'Hola {patient_name},

Te recordamos tu próxima cita:

Fecha: {date}
Hora: {time}
Servicio: {service}

Si necesitas reagendar o cancelar, por favor contáctanos.

Saludos,
Equipo de {clinic_name}'
FROM clinics
ON CONFLICT (clinic_id, template_type) DO NOTHING;

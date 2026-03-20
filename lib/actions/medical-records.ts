'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const medicalRecordSchema = z.object({
    patient_id: z.string().uuid('ID de paciente inválido'),
    diagnosis: z.string().min(1, 'El diagnóstico es requerido').max(2000),
    treatment_plan: z.string().max(2000).optional().default(''),
    notes: z.string().max(2000).optional().default(''),
})

const therapySessionSchema = z.object({
    patient_id: z.string().uuid('ID de paciente inválido'),
    session_date: z.string().min(1, 'La fecha es requerida'),
    duration_minutes: z.number().int().min(1).max(480),
    notes: z.string().max(5000).optional().default(''),
    exercises: z.array(z.any()).optional().default([]),
    progress_rating: z.number().int().min(0).max(10),
})

export async function getMedicalRecords(patientId: string) {
    if (!patientId || typeof patientId !== 'string') return []

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single()
    if (!profile?.clinic_id) return []

    // Verify the patient belongs to this clinic before returning records
    const { data: patient } = await supabase.from('patients').select('id').eq('id', patientId).eq('clinic_id', profile.clinic_id).maybeSingle()
    if (!patient) return []

    const { data, error } = await supabase
        .from('medical_records')
        .select(`
      id,
      diagnosis,
      treatment_plan,
      notes,
      created_at,
      doctor_id,
      profiles:doctor_id (full_name)
    `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching medical records:', error)
        return []
    }

    return data.map((record: any) => ({
        ...record,
        profiles: Array.isArray(record.profiles) ? record.profiles[0] : record.profiles
    }))
}

export async function createMedicalRecord(data: {
    patient_id: string
    diagnosis: string
    treatment_plan: string
    notes: string
}) {
    const validated = medicalRecordSchema.safeParse(data)
    if (!validated.success) {
        throw new Error(validated.error.issues[0]?.message ?? 'Datos de expediente inválidos')
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single()

    if (!profile?.clinic_id) throw new Error('No se encontró la clínica del usuario')

    const { error } = await supabase.from('medical_records').insert({
        clinic_id: profile.clinic_id,
        patient_id: validated.data.patient_id,
        doctor_id: user.id,
        diagnosis: validated.data.diagnosis,
        treatment_plan: validated.data.treatment_plan,
        notes: validated.data.notes
    })

    if (error) {
        console.error('Error creating medical record:', error)
        throw new Error('Error al crear el expediente médico')
    }
}

export async function getTherapySessions(patientId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single()
    if (!profile?.clinic_id) return []

    // Verify the patient belongs to this clinic
    const { data: patient } = await supabase.from('patients').select('id').eq('id', patientId).eq('clinic_id', profile.clinic_id).maybeSingle()
    if (!patient) return []

    const { data, error } = await supabase
        .from('therapy_sessions')
        .select(`
            id,
            session_date,
            duration_minutes,
            notes,
            exercises,
            progress_rating,
            created_at,
            physio_id,
            profiles:physio_id (full_name)
        `)
        .eq('patient_id', patientId)
        .order('session_date', { ascending: false })

    if (error) {
        console.error('Error fetching therapy sessions:', error)
        return []
    }

    return data.map((session: any) => ({
        ...session,
        profiles: Array.isArray(session.profiles) ? session.profiles[0] : session.profiles
    }))
}

export async function createTherapySession(data: {
    patient_id: string
    session_date: string
    duration_minutes: number
    notes: string
    exercises: any[]
    progress_rating: number
}) {
    const validated = therapySessionSchema.safeParse(data)
    if (!validated.success) {
        throw new Error(validated.error.issues[0]?.message ?? 'Datos de sesión inválidos')
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('No se encontró la clínica del usuario')

    const { error } = await supabase
        .from('therapy_sessions')
        .insert({
            clinic_id: profile.clinic_id,
            patient_id: validated.data.patient_id,
            physio_id: user.id,
            session_date: validated.data.session_date,
            duration_minutes: validated.data.duration_minutes,
            notes: validated.data.notes,
            exercises: validated.data.exercises,
            progress_rating: validated.data.progress_rating
        })

    if (error) {
        console.error('Error creating therapy session:', error)
        throw new Error('Error al crear la sesión de terapia')
    }
}

export async function updateTherapySession(id: string, data: {
    notes: string
    exercises: any[]
    progress_rating: number
}) {
    if (!id || typeof id !== 'string') throw new Error('ID de sesión inválido')

    const validated = z.object({
        notes: z.string().max(5000).optional().default(''),
        exercises: z.array(z.any()).optional().default([]),
        progress_rating: z.number().int().min(0).max(10),
    }).safeParse(data)

    if (!validated.success) {
        throw new Error(validated.error.issues[0]?.message ?? 'Datos de sesión inválidos')
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user.id).single()
    if (!profile?.clinic_id) throw new Error('Sin clínica asignada')

    const { error } = await supabase
        .from('therapy_sessions')
        .update({
            notes: validated.data.notes,
            exercises: validated.data.exercises,
            progress_rating: validated.data.progress_rating
        })
        .eq('id', id)
        .eq('clinic_id', profile.clinic_id)

    if (error) {
        console.error('Error updating therapy session:', error)
        throw new Error('Error al actualizar la sesión de terapia')
    }
}

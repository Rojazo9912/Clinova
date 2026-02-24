'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getMedicalRecords(patientId: string) {
    const cookieStore = await cookies()
    const supabase = await createClient()

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

    // Supabase returns arrays for relations sometimes. We map to ensure it matches expectations.
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
    const cookieStore = await cookies()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Get clinic_id
    const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user?.id).single()

    if (!profile?.clinic_id) throw new Error('No clinic found for user')

    const { error } = await supabase.from('medical_records').insert({
        clinic_id: profile.clinic_id,
        patient_id: data.patient_id,
        doctor_id: user?.id,
        diagnosis: data.diagnosis,
        treatment_plan: data.treatment_plan,
        notes: data.notes
    })

    if (error) {
        console.error('Error creating medical record:', error)
        throw new Error('Failed to create medical record')
    }
}

export async function getTherapySessions(patientId: string) {
    const supabase = await createClient()

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
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user?.id)
        .single()

    if (!profile?.clinic_id) throw new Error('No clinic found for user')

    const { error } = await supabase
        .from('therapy_sessions')
        .insert({
            clinic_id: profile.clinic_id,
            patient_id: data.patient_id,
            physio_id: user?.id,
            session_date: data.session_date,
            duration_minutes: data.duration_minutes,
            notes: data.notes,
            exercises: data.exercises,
            progress_rating: data.progress_rating
        })

    if (error) {
        console.error('Error creating therapy session:', error)
        throw new Error('Failed to create therapy session')
    }
}

export async function updateTherapySession(id: string, data: {
    notes: string
    exercises: any[]
    progress_rating: number
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('therapy_sessions')
        .update({
            notes: data.notes,
            exercises: data.exercises,
            progress_rating: data.progress_rating
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating therapy session:', error)
        throw new Error('Failed to update therapy session')
    }
}

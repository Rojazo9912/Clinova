'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const patientSchema = z.object({
    first_name: z.string().min(1, 'El nombre es requerido').max(100),
    last_name: z.string().min(1, 'El apellido es requerido').max(100),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().max(20).optional(),
    birth_date: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postal_code: z.string().max(20).optional(),
    emergency_contact_name: z.string().max(100).optional(),
    emergency_contact_phone: z.string().max(20).optional(),
    emergency_contact_relationship: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
})

export async function createPatient(data: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
    birth_date?: string
    gender?: string
    address?: string
    city?: string
    state?: string
    postal_code?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_relationship?: string
    notes?: string
}) {
    const validated = patientSchema.safeParse(data)
    if (!validated.success) {
        throw new Error(validated.error.errors[0]?.message ?? 'Datos de paciente inválidos')
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) {
        throw new Error('El usuario no pertenece a una clínica')
    }

    const { data: newPatient, error } = await supabase
        .from('patients')
        .insert({
            ...validated.data,
            email: validated.data.email || null,
            clinic_id: profile.clinic_id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating patient:', error)
        throw new Error('Error al crear el paciente')
    }

    return newPatient
}

export async function searchPatients(query: string) {
    const supabase = await createClient()

    let queryBuilder = supabase
        .from('patients')
        .select('id, first_name, last_name, email, phone, created_at, patient_users(is_active), clinics(name)')

    if (query) {
        queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    } else {
        queryBuilder = queryBuilder.order('created_at', { ascending: false }).limit(20)
    }

    const { data, error } = await queryBuilder

    if (error) {
        console.error('Error searching patients:', error)
        return []
    }

    if (!data || data.length === 0) return []

    // Enrich with last session date per patient
    const patientIds = data.map(p => p.id)
    const { data: sessions } = await supabase
        .from('therapy_sessions')
        .select('patient_id, session_date')
        .in('patient_id', patientIds)
        .order('session_date', { ascending: false })

    const lastSessionMap: Record<string, string> = {}
    for (const s of sessions || []) {
        if (!lastSessionMap[s.patient_id]) {
            lastSessionMap[s.patient_id] = s.session_date
        }
    }

    return data.map(p => ({
        ...p,
        last_session_date: lastSessionMap[p.id] ?? null,
    }))
}

export async function updatePatient(id: string, data: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
    birth_date?: string
    gender?: string
    address?: string
    city?: string
    state?: string
    postal_code?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_relationship?: string
    notes?: string
}) {
    if (!id || typeof id !== 'string') throw new Error('ID de paciente inválido')

    const validated = patientSchema.safeParse(data)
    if (!validated.success) {
        throw new Error(validated.error.errors[0]?.message ?? 'Datos de paciente inválidos')
    }

    const supabase = await createClient()

    const { data: updated, error } = await supabase
        .from('patients')
        .update({ ...validated.data, email: validated.data.email || null })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating patient:', error)
        throw new Error('Error al actualizar el paciente')
    }

    return updated
}

export async function getPatientById(id: string) {
    if (!id || typeof id !== 'string') return null

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching patient:', error)
        return null
    }

    return data
}

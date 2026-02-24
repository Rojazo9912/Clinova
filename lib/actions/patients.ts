'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

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
    // const cookieStore = await cookies()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Get clinic_id from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user?.id)
        .single()

    if (!profile?.clinic_id) {
        throw new Error('User does not belong to a clinic')
    }

    const { data: newPatient, error } = await supabase
        .from('patients')
        .insert({
            ...data,
            clinic_id: profile.clinic_id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating patient:', error)
        throw new Error('Failed to create patient')
    }

    return newPatient
}

export async function searchPatients(query: string) {
    // const cookieStore = await cookies()
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

    return data
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
    const supabase = await createClient()

    const { data: updated, error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating patient:', error)
        throw new Error('Failed to update patient')
    }

    return updated
}

export async function getPatientById(id: string) {
    // const cookieStore = await cookies()
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

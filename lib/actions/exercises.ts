'use server'

import { createClient } from '@/lib/supabase/server'

export interface Exercise {
    id: string
    clinic_id: string
    created_by: string
    name: string
    description: string
    category: 'mobility' | 'strength' | 'stretching' | 'balance' | 'breathing' | 'functional'
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    duration_minutes: number | null
    repetitions: string | null
    sets: number | null
    image_url: string | null
    video_url: string | null
    is_shared: boolean
    created_at: string
    updated_at: string
}

export interface PatientExercise {
    id: string
    patient_id: string
    exercise_id: string
    assigned_by: string
    assigned_date: string
    notes: string | null
    frequency: string | null
    status: 'active' | 'completed' | 'paused'
    completed_date: string | null
    exercises?: Exercise
}

export async function getExercises(filters?: {
    category?: string
    difficulty?: string
    search?: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.clinic_id) return []

    let query = supabase
        .from('exercises')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .order('name')

    if (filters?.category) {
        query = query.eq('category', filters.category)
    }

    if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
    }

    if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`)
    }

    const { data: exercises } = await query

    return exercises || []
}

export async function createExercise(data: {
    name: string
    description: string
    category: string
    difficulty: string
    duration_minutes?: number
    repetitions?: string
    sets?: number
    image_url?: string
    video_url?: string
    is_shared: boolean
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.clinic_id) throw new Error('No clinic found')

    const { error } = await supabase
        .from('exercises')
        .insert({
            clinic_id: profile.clinic_id,
            created_by: user.id,
            ...data
        })

    if (error) throw error

    return { success: true }
}

export async function updateExercise(id: string, data: {
    name: string
    description: string
    category: string
    difficulty: string
    duration_minutes?: number
    repetitions?: string
    sets?: number
    image_url?: string
    video_url?: string
    is_shared: boolean
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('exercises')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('created_by', user.id)

    if (error) throw error

    return { success: true }
}

export async function deleteExercise(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id)

    if (error) throw error

    return { success: true }
}

export async function assignExerciseToPatient(data: {
    patient_id: string
    exercise_id: string
    notes?: string
    frequency?: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('patient_exercises')
        .insert({
            patient_id: data.patient_id,
            exercise_id: data.exercise_id,
            assigned_by: user.id,
            notes: data.notes,
            frequency: data.frequency,
            status: 'active'
        })

    if (error) throw error

    return { success: true }
}

export async function unassignExercise(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('patient_exercises')
        .delete()
        .eq('id', id)

    if (error) throw error

    return { success: true }
}

export async function getPatientExercises(patientId: string) {
    const supabase = await createClient()

    const { data: assignments } = await supabase
        .from('patient_exercises')
        .select(`
            *,
            exercises (*)
        `)
        .eq('patient_id', patientId)
        .order('assigned_date', { ascending: false })

    return assignments || []
}

export async function updateExerciseStatus(id: string, status: 'active' | 'completed' | 'paused') {
    const supabase = await createClient()

    const updateData: any = {
        status,
        updated_at: new Date().toISOString()
    }

    if (status === 'completed') {
        updateData.completed_date = new Date().toISOString()
    }

    const { error } = await supabase
        .from('patient_exercises')
        .update(updateData)
        .eq('id', id)

    if (error) throw error

    return { success: true }
}

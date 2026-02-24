'use server'

import { createClient } from '@/lib/supabase/server'

export interface TreatmentPlanGoal {
    id: string
    description: string
    target_value?: number
    metric?: string // 'dolor', 'rom', 'movilidad', 'fuerza', 'custom'
    achieved: boolean
    achieved_at?: string
}

export interface TreatmentPlanData {
    patient_id: string
    title: string
    diagnosis?: string
    total_sessions: number
    frequency?: string
    package_price?: number
    session_price?: number
    start_date?: string
    estimated_end_date?: string
    goals?: TreatmentPlanGoal[]
    physio_id?: string
    notes?: string
}

export interface TreatmentPlan {
    id: string
    patient_id: string
    clinic_id: string
    created_by: string
    physio_id?: string
    title: string
    diagnosis?: string
    status: 'active' | 'completed' | 'paused' | 'cancelled'
    total_sessions: number
    completed_sessions: number
    frequency?: string
    package_price?: number
    session_price?: number
    paid_amount: number
    start_date?: string
    estimated_end_date?: string
    actual_end_date?: string
    goals: TreatmentPlanGoal[]
    discharge_notes?: string
    discharge_reason?: string
    notes?: string
    created_at: string
    updated_at: string
}

export async function createTreatmentPlan(data: TreatmentPlanData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'No autorizado' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return { success: false, message: 'Sin clínica asignada' }

    const { data: plan, error } = await supabase
        .from('treatment_plans')
        .insert({
            ...data,
            clinic_id: profile.clinic_id,
            created_by: user.id,
            goals: data.goals || [],
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating treatment plan:', error)
        return { success: false, message: 'Error al crear plan de tratamiento' }
    }

    return { success: true, data: plan }
}

export async function getPatientTreatmentPlans(patientId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('treatment_plans')
        .select('*, profiles!treatment_plans_physio_id_fkey(first_name, last_name)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching treatment plans:', error)
        return []
    }

    return data || []
}

export async function updateTreatmentPlan(id: string, data: Partial<TreatmentPlanData> & {
    status?: string
    completed_sessions?: number
    paid_amount?: number
    actual_end_date?: string
    discharge_notes?: string
    discharge_reason?: string
}) {
    const supabase = await createClient()

    const { data: updated, error } = await supabase
        .from('treatment_plans')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating treatment plan:', error)
        return { success: false, message: 'Error al actualizar plan' }
    }

    return { success: true, data: updated }
}

export async function incrementPlanSession(planId: string) {
    const supabase = await createClient()

    // Get current plan
    const { data: plan } = await supabase
        .from('treatment_plans')
        .select('completed_sessions, total_sessions')
        .eq('id', planId)
        .single()

    if (!plan) return { success: false, message: 'Plan no encontrado' }

    const newCompleted = (plan.completed_sessions || 0) + 1
    const isComplete = newCompleted >= plan.total_sessions

    const updateData: any = {
        completed_sessions: newCompleted,
        updated_at: new Date().toISOString(),
    }

    if (isComplete) {
        updateData.status = 'completed'
        updateData.actual_end_date = new Date().toISOString().split('T')[0]
    }

    const { error } = await supabase
        .from('treatment_plans')
        .update(updateData)
        .eq('id', planId)

    if (error) {
        console.error('Error incrementing session:', error)
        return { success: false, message: 'Error al registrar sesión' }
    }

    return { success: true, completed: newCompleted, isComplete }
}

export async function dischargePlan(id: string, data: {
    discharge_notes: string
    discharge_reason: string
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('treatment_plans')
        .update({
            status: 'completed',
            actual_end_date: new Date().toISOString().split('T')[0],
            discharge_notes: data.discharge_notes,
            discharge_reason: data.discharge_reason,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)

    if (error) {
        console.error('Error discharging plan:', error)
        return { success: false, message: 'Error al dar de alta' }
    }

    return { success: true }
}

export async function updateGoalStatus(planId: string, goalId: string, achieved: boolean) {
    const supabase = await createClient()

    const { data: plan } = await supabase
        .from('treatment_plans')
        .select('goals')
        .eq('id', planId)
        .single()

    if (!plan) return { success: false, message: 'Plan no encontrado' }

    const goals = (plan.goals as TreatmentPlanGoal[]).map(g =>
        g.id === goalId
            ? { ...g, achieved, achieved_at: achieved ? new Date().toISOString() : undefined }
            : g
    )

    const { error } = await supabase
        .from('treatment_plans')
        .update({ goals, updated_at: new Date().toISOString() })
        .eq('id', planId)

    if (error) {
        console.error('Error updating goal:', error)
        return { success: false, message: 'Error al actualizar objetivo' }
    }

    return { success: true }
}

export async function getActivePlanForPatient(patientId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('Error fetching active plan:', error)
        return null
    }

    return data
}

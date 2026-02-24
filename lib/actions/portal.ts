'use server'

import { createClient } from '@/lib/supabase/server'

export async function getPatientAppointments() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get patient ID
    const { data: patientUser } = await supabase
        .from('patient_users')
        .select('patient_id')
        .eq('user_id', user.id)
        .single()

    if (!patientUser) return []

    // Get all appointments
    const { data } = await supabase
        .from('appointments')
        .select(`
            id,
            start_time,
            end_time,
            status,
            notes,
            services!inner(name),
            profiles!inner(first_name, last_name)
        `)
        .eq('patient_id', patientUser.patient_id)
        .order('start_time', { ascending: false })

    return (data || []).map((apt: any) => ({
        id: apt.id,
        start_time: apt.start_time,
        end_time: apt.end_time,
        status: apt.status,
        notes: apt.notes,
        service: apt.services,
        physiotherapist: apt.profiles
    }))
}

export async function cancelAppointment(appointmentId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', appointmentId)

        if (error) throw error

        return { success: true, message: 'Cita cancelada exitosamente' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function getPatientMedicalRecords() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: patientUser } = await supabase
        .from('patient_users')
        .select('patient_id')
        .eq('user_id', user.id)
        .single()

    if (!patientUser) return []

    const { data } = await supabase
        .from('therapy_sessions')
        .select(`
            id,
            session_date,
            diagnosis,
            treatment,
            notes,
            services!inner(name),
            profiles!inner(first_name, last_name)
        `)
        .eq('patient_id', patientUser.patient_id)
        .order('session_date', { ascending: false })

    return (data || []).map((session: any) => ({
        id: session.id,
        session_date: session.session_date,
        diagnosis: session.diagnosis,
        treatment: session.treatment,
        notes: session.notes,
        service: session.services,
        physiotherapist: session.profiles
    }))
}

export async function getPatientPayments() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: patientUser } = await supabase
        .from('patient_users')
        .select('patient_id')
        .eq('user_id', user.id)
        .single()

    if (!patientUser) return []

    const { data } = await supabase
        .from('payments')
        .select(`
            id,
            amount,
            payment_date,
            payment_method,
            status,
            services!inner(name)
        `)
        .eq('patient_id', patientUser.patient_id)
        .order('payment_date', { ascending: false })

    return (data || []).map((payment: any) => ({
        id: payment.id,
        amount: payment.amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        status: payment.status,
        service: payment.services
    }))
}

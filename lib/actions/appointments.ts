'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getAppointments(start: Date, end: Date) {
    const cookieStore = await cookies()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      id,
      start_time,
      end_time,
      status,
      patient_id
    `)
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())

    if (error) {
        console.error('Error fetching appointments:', error)
        return []
    }

    return data.map((apt: any) => ({
        id: apt.id,
        title: 'Cita',
        start: new Date(apt.start_time),
        end: new Date(apt.end_time),
        status: apt.status
    }))
}

export async function createAppointment(data: {
    start: Date
    end: Date
    patient_id?: string
    service_id?: string
}) {
    const cookieStore = await cookies()
    const supabase = await createClient()

    // Get current user and clinic
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('No clinic found')

    const { error } = await supabase.from('appointments').insert({
        start_time: data.start.toISOString(),
        end_time: data.end.toISOString(),
        patient_id: data.patient_id || null,
        clinic_id: profile.clinic_id
    })

    if (error) {
        console.error('Error creating appointment:', error)
        throw new Error('Failed to create appointment')
    }
}

export async function updateAppointment(id: string, data: {
    title?: string
    start?: Date
    end?: Date
    patient_id?: string
}) {
    const supabase = await createClient()

    const updateData: any = {}
    if (data.title) updateData.title = data.title
    if (data.start) updateData.start_time = data.start.toISOString()
    if (data.end) updateData.end_time = data.end.toISOString()
    if (data.patient_id) updateData.patient_id = data.patient_id

    const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating appointment:', error)
        throw new Error('Failed to update appointment')
    }
}

export async function confirmAppointment(token: string) {
    const supabase = await createClient()

    // 1. Find appointment by token
    const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select(`
            id, 
            start_time, 
            status,
            patients (first_name, last_name),
            clinics (name)
        `)
        .eq('confirmation_token', token)
        .single()

    if (fetchError || !appointment) {
        console.error('Error finding appointment:', fetchError)
        return { success: false, message: 'Cita no encontrada o enlace inválido.' }
    }

    if (appointment.status === 'confirmed') {
        return {
            success: true,
            alreadyConfirmed: true,
            data: appointment
        }
    }

    // 2. Update status to confirmed
    const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointment.id)

    if (updateError) {
        console.error('Error confirming appointment:', updateError)
        return { success: false, message: 'Error al confirmar la cita.' }
    }

    return { success: true, data: appointment }
}

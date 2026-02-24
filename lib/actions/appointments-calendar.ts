'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAppointmentsForCalendar() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            id,
            start_time,
            end_time,
            status,
            notes,
            patients (
                id,
                first_name,
                last_name
            ),
            services (
                id,
                name
            )
        `)
        .eq('clinic_id', profile.clinic_id)
        .order('start_time', { ascending: true })

    if (!appointments) return []

    return appointments.map((apt: any) => ({
        id: apt.id,
        title: `${apt.patients?.first_name || ''} ${apt.patients?.last_name || ''} - ${apt.services?.name || 'Consulta'}`,
        start: new Date(apt.start_time),
        end: new Date(apt.end_time),
        resource: {
            patientId: apt.patients?.id,
            patientName: `${apt.patients?.first_name || ''} ${apt.patients?.last_name || ''}`,
            serviceId: apt.services?.id,
            serviceName: apt.services?.name || 'Consulta',
            status: apt.status
        }
    }))
}

export async function updateAppointmentTime(appointmentId: string, startTime: Date, endTime: Date) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('appointments')
        .update({
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString()
        })
        .eq('id', appointmentId)

    if (error) {
        console.error('Error updating appointment time:', error)
        throw new Error('Failed to update appointment')
    }

    revalidatePath('/dashboard/agenda')
}

export async function createQuickAppointment(data: {
    patientId: string
    serviceId: string
    startTime: Date
    endTime: Date
    notes?: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('No clinic found')

    const { error } = await supabase
        .from('appointments')
        .insert({
            patient_id: data.patientId,
            service_id: data.serviceId,
            clinic_id: profile.clinic_id,
            start_time: data.startTime.toISOString(),
            end_time: data.endTime.toISOString(),
            status: 'pending',
            notes: data.notes || null
        })

    if (error) {
        console.error('Error creating appointment:', error)
        throw new Error('Failed to create appointment')
    }

    revalidatePath('/dashboard/agenda')
}

export async function getPatientsForCalendar() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const { data: patients } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .eq('clinic_id', profile.clinic_id)
        .order('first_name')

    return patients || []
}

export async function getServicesForCalendar() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const { data: services } = await supabase
        .from('services')
        .select('id, name, price')
        .eq('clinic_id', profile.clinic_id)
        .order('name')

    return services || []
}

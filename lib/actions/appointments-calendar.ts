'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { exportAppointmentToGoogleCalendar, fetchGoogleCalendarEvents } from './calendar-sync'

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
    startTime: Date | string
    endTime: Date | string
    notes?: string
}) {
    const supabase = await createClient()

    try {
        console.log('--- START createQuickAppointment ---')
        console.log('Received data:', data)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        console.log('User authenticated:', user.id)

        const { data: profile } = await supabase
            .from('profiles')
            .select('clinic_id')
            .eq('id', user.id)
            .single()

        console.log('Profile found:', profile)

        if (!profile?.clinic_id) throw new Error('No clinic found')

        const startIso = new Date(data.startTime).toISOString()
        const endIso = new Date(data.endTime).toISOString()

        console.log('Dates parsed:', { startIso, endIso })

        console.log('Inserting to Supabase DB...')
        const { error, data: newApt } = await supabase
            .from('appointments')
            .insert({
                patient_id: data.patientId || null,
                service_id: data.serviceId || null,
                clinic_id: profile.clinic_id,
                start_time: startIso,
                end_time: endIso,
                notes: data.notes || null
            }).select().single()

        if (error) {
            console.error('Supabase DB Insert Error:', error)
            throw new Error('Database Error: ' + error.message)
        }

        console.log('Appointment created successfully:', newApt)

        // Exportar a Google Calendar de forma síncrona para atrapar errores
        console.log('Starting Google Calendar Export...')
        const gcalResponse = await exportAppointmentToGoogleCalendar(user.id, {
            title: 'Cita en Clinova',
            start: new Date(data.startTime),
            end: new Date(data.endTime),
            description: `Paciente ID: ${data.patientId || 'No asignado'}\nCita creada desde la Agenda de Clinova.`
        })
        console.log('GCal Response:', gcalResponse)

        revalidatePath('/dashboard/agenda')
        console.log('--- END createQuickAppointment ---')
    } catch (error: any) {
        console.error('CRITICAL ERROR in createQuickAppointment:', error)
        throw new Error(error.message || 'Unknown Server Error in createQuickAppointment')
    }
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

export async function getGoogleCalendarBlocks(startDate: Date, endDate: Date) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Llamar a nuestra función de sincronización que interactúa con Google APIs
    const gcalEvents = await fetchGoogleCalendarEvents(user.id, startDate, endDate)

    // Formatear los eventos al formato que espera react-big-calendar y la Agenda de Clinova
    return gcalEvents.map((event: any) => ({
        id: event.id,
        title: `🔵 ${event.summary}`,
        start: new Date(event.start),
        end: new Date(event.end),
        resource: {
            patientId: '',
            patientName: '',
            serviceId: '',
            serviceName: '',
            status: 'blocked',
            isBlock: true,
            isGcal: true // Bandera útil para UI
        }
    }))
}

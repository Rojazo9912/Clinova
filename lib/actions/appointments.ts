'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { exportAppointmentToGoogleCalendar } from './calendar-sync'

const createAppointmentSchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
    patient_id: z.string().uuid().optional(),
    service_id: z.string().uuid().optional(),
}).refine(data => data.end > data.start, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['end'],
})

const updateAppointmentSchema = z.object({
    title: z.string().max(255).optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
    patient_id: z.string().uuid().optional(),
})

export async function getAppointments(start: Date, end: Date) {
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
    const validated = createAppointmentSchema.safeParse(data)
    if (!validated.success) {
        throw new Error(validated.error.issues[0]?.message ?? 'Datos de cita inválidos')
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

    const { error, data: newApt } = await supabase.from('appointments').insert({
        start_time: validated.data.start.toISOString(),
        end_time: validated.data.end.toISOString(),
        patient_id: validated.data.patient_id || null,
        clinic_id: profile.clinic_id
    }).select().single()

    if (error) {
        console.error('Error creating appointment:', error)
        throw new Error('Error al crear la cita')
    }

    const [patientResult, serviceResult] = await Promise.all([
        validated.data.patient_id
            ? supabase.from('patients').select('first_name, last_name').eq('id', validated.data.patient_id).single()
            : Promise.resolve({ data: null }),
        validated.data.service_id
            ? supabase.from('services').select('name, description').eq('id', validated.data.service_id).single()
            : Promise.resolve({ data: null }),
    ])

    const patient = patientResult.data
    const patientName = patient ? `${(patient as any).first_name} ${(patient as any).last_name}` : 'Sin paciente'
    const serviceName = (serviceResult.data as any)?.name ?? null
    const serviceDescription = (serviceResult.data as any)?.description ?? null

    const eventTitle = serviceName ? `${patientName} — ${serviceName}` : patientName

    exportAppointmentToGoogleCalendar(user.id, {
        title: eventTitle,
        start: validated.data.start,
        end: validated.data.end,
        description: [
            `Paciente: ${patientName}`,
            serviceName ? `Servicio: ${serviceName}` : null,
            serviceDescription ? `Descripción: ${serviceDescription}` : null,
            'Cita creada desde AxoMed.',
        ].filter(Boolean).join('\n')
    }).catch(console.error)
}

export async function updateAppointment(id: string, data: {
    title?: string
    start?: Date
    end?: Date
    patient_id?: string
}) {
    if (!id || typeof id !== 'string') throw new Error('ID de cita inválido')

    const validated = updateAppointmentSchema.safeParse(data)
    if (!validated.success) {
        throw new Error(validated.error.issues[0]?.message ?? 'Datos inválidos')
    }

    const supabase = await createClient()

    const updateData: Record<string, any> = {}
    if (validated.data.title) updateData.title = validated.data.title
    if (validated.data.start) updateData.start_time = validated.data.start.toISOString()
    if (validated.data.end) updateData.end_time = validated.data.end.toISOString()
    if (validated.data.patient_id) updateData.patient_id = validated.data.patient_id

    const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating appointment:', error)
        throw new Error('Error al actualizar la cita')
    }
}

export async function confirmAppointment(token: string) {
    if (!token || typeof token !== 'string' || token.length < 10) {
        return { success: false, message: 'Token inválido.' }
    }

    const supabase = await createClient()

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
        return { success: false, message: 'Cita no encontrada o enlace inválido.' }
    }

    if (appointment.status === 'confirmed') {
        return { success: true, alreadyConfirmed: true, data: appointment }
    }

    const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointment.id)

    if (updateError) {
        return { success: false, message: 'Error al confirmar la cita.' }
    }

    return { success: true, data: appointment }
}

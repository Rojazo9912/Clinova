'use server'

import { createClient } from '@/lib/supabase/server'
import { addMinutes, format, isAfter, isBefore, isEqual, parseISO, startOfHour, startOfDay, endOfDay, setHours, setMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { getActivePlanForPatient } from './treatment-plans'
import { getPatientMeasurements } from './clinical-measurements'

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
            profiles!inner(full_name)
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
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, message: 'No autenticado' }

        const { data: patientUser } = await supabase
            .from('patient_users')
            .select('patient_id')
            .eq('user_id', user.id)
            .single()

        if (!patientUser) return { success: false, message: 'Paciente no encontrado' }

        // Only allow cancellation of the patient's OWN appointments
        const { error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', appointmentId)
            .eq('patient_id', patientUser.patient_id)

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
            profiles!inner(full_name)
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

    const [{ data }, { data: patientInfo }] = await Promise.all([
        supabase
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
            .order('payment_date', { ascending: false }),
        supabase
            .from('patients')
            .select('first_name, last_name, clinics!inner(name)')
            .eq('id', patientUser.patient_id)
            .single()
    ])

    const patientName = patientInfo
        ? `${(patientInfo as any).first_name} ${(patientInfo as any).last_name}`
        : ''
    const clinicName = (patientInfo as any)?.clinics?.name ?? ''

    return (data || []).map((payment: any) => ({
        id: payment.id,
        amount: payment.amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        status: payment.status,
        service: payment.services,
        patient_name: patientName,
        clinic_name: clinicName
    }))
}

export async function getClinicServices() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: patientUser } = await supabase
        .from('patient_users')
        .select('patients!inner(clinic_id)')
        .eq('user_id', user.id)
        .single()

    if (!patientUser) return []

    const { data } = await supabase
        .from('services')
        .select('id, name, duration_minutes, price')
        .eq('clinic_id', (patientUser as any).patients.clinic_id)
        .eq('is_active', true)
        .order('name')

    return data || []
}

export async function getClinicPhysiotherapists() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: patientUser } = await supabase
        .from('patient_users')
        .select('patients!inner(clinic_id)')
        .eq('user_id', user.id)
        .single()

    if (!patientUser) return []

    const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('clinic_id', (patientUser as any).patients.clinic_id)
        .eq('role', 'physiotherapist')
        .order('full_name')

    return data || []
}

export async function getAvailableSlots(date: string, serviceId: string, therapistId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Get Clinic Info & Service Duration
    const [{ data: patientInfo }, { data: service }] = await Promise.all([
        supabase
            .from('patient_users')
            .select('patients!inner(clinic_id)')
            .eq('user_id', user.id)
            .single(),
        supabase
            .from('services')
            .select('duration_minutes')
            .eq('id', serviceId)
            .single()
    ])

    if (!patientInfo || !service) return []
    const clinicId = (patientInfo as any).patients.clinic_id
    const duration = service.duration_minutes

    const { data: clinic } = await supabase
        .from('clinics')
        .select('business_hours')
        .eq('id', clinicId)
        .single()

    if (!clinic?.business_hours) return []

    // 2. Get Business Hours for the day
    const dayName = format(parseISO(date), 'eeee', { locale: es }).toLowerCase()
    const hours = (clinic.business_hours as any)[dayName]
    if (!hours || hours.closed) return []

    // 3. Get existing appointments and blocks
    const startRange = `${date}T${hours.open}:00`
    const endRange = `${date}T${hours.close}:00`

    const [{ data: appointments }, { data: blocks }] = await Promise.all([
        supabase
            .from('appointments')
            .select('start_time, end_time')
            .eq('clinic_id', clinicId)
            .eq('status', 'scheduled')
            .gte('start_time', startRange)
            .lte('end_time', endRange)
            .filter('therapist_id', therapistId ? 'eq' : 'is', therapistId || null),
        supabase
            .from('availability_blocks')
            .select('start_time, end_time')
            .eq('clinic_id', clinicId)
            .gte('start_time', startRange)
            .lte('end_time', endRange)
            .filter('therapist_id', therapistId ? 'eq' : 'is', therapistId || null)
    ])

    // 4. Generate slots every 30 mins
    const slots: string[] = []
    let current = parseISO(startRange)
    const end = parseISO(endRange)

    while (isBefore(addMinutes(current, duration), end) || isEqual(addMinutes(current, duration), end)) {
        const slotStart = current
        const slotEnd = addMinutes(current, duration)

        // Check conflicts
        const hasConflict = 
            (appointments || []).some((apt: any) => {
                const aptStart = parseISO(apt.start_time)
                const aptEnd = parseISO(apt.end_time)
                return (isBefore(slotStart, aptEnd) && isAfter(slotEnd, aptStart))
            }) ||
            (blocks || []).some((block: any) => {
                const blockStart = parseISO(block.start_time)
                const blockEnd = parseISO(block.end_time)
                return (isBefore(slotStart, blockEnd) && isAfter(slotEnd, blockStart))
            })

        // Don't show past slots if today
        const isPast = isBefore(slotStart, new Date())

        if (!hasConflict && !isPast) {
            slots.push(format(slotStart, 'HH:mm'))
        }

        current = addMinutes(current, 30) // Offset for next potential slot
    }

    return slots
}

export async function bookAppointment(data: {
    serviceId: string
    therapistId: string | null
    date: string
    time: string
    notes?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'No autenticado' }

    try {
        // Get patient and clinic ID
        const { data: patientUser } = await supabase
            .from('patient_users')
            .select('patient_id, patients!inner(clinic_id)')
            .eq('user_id', user.id)
            .single()

        if (!patientUser) return { success: false, message: 'Paciente no encontrado' }

        const { data: service } = await supabase
            .from('services')
            .select('duration_minutes')
            .eq('id', data.serviceId)
            .single()

        if (!service) return { success: false, message: 'Servicio no encontrado' }

        const startTime = parseISO(`${data.date}T${data.time}:00`)
        const endTime = addMinutes(startTime, service.duration_minutes)

        const { error } = await supabase
            .from('appointments')
            .insert({
                patient_id: patientUser.patient_id,
                clinic_id: (patientUser as any).patients.clinic_id,
                service_id: data.serviceId,
                therapist_id: data.therapistId,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                status: 'scheduled',
                notes: data.notes || '',
                created_at: new Date().toISOString()
            })

        if (error) throw error

        return { success: true, message: 'Cita agendada exitosamente' }
    } catch (error: any) {
        console.error('Booking error:', error)
        return { success: false, message: error.message }
    }
}

export async function getPatientActivePlan() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: patientUser } = await supabase
        .from('patient_users')
        .select('patient_id')
        .eq('user_id', user.id)
        .single()

    if (!patientUser) return null

    return await getActivePlanForPatient(patientUser.patient_id)
}

export async function getPatientClinicalEvolution() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: patientUser } = await supabase
        .from('patient_users')
        .select('patient_id')
        .eq('user_id', user.id)
        .single()

    if (!patientUser) return []

    const measurements = await getPatientMeasurements(patientUser.patient_id)
    return measurements || []
}

export async function getPatientProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

    return patient
}

export async function updatePatientProfile(data: {
    first_name: string
    last_name: string
    phone?: string
    address?: string
    city?: string
    state?: string
    postal_code?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'No autenticado' }

    const { error } = await supabase
        .from('patients')
        .update(data)
        .eq('auth_user_id', user.id)

    if (error) {
        console.error('Update profile error:', error)
        return { success: false, message: 'Error al actualizar perfil' }
    }

    return { success: true, message: 'Perfil actualizado' }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp'
import { sendEmail } from '@/lib/notifications/email'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function sendAppointmentReminder(appointmentId: string) {
    const supabase = await createClient()

    // Fetch appointment with patient and clinic details
    // Note: We need to join properly. 
    // Assuming simple structure: appointments -> patients.
    const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
            *,
            patients (
                first_name,
                last_name,
                email,
                phone
            ),
            clinics (
                name
            )
        `)
        .eq('id', appointmentId)
        .single()

    if (error || !appointment) {
        console.error('Error fetching appointment for reminder:', error)
        return { success: false, error: 'Appointment not found' }
    }

    const patient = appointment.patients
    if (!patient) return { success: false, error: 'Patient not found' }

    const clinicName = appointment.clinics?.name || 'Clínica'
    const dateStr = format(new Date(appointment.start_time), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })

    const messageBody = `Hola ${patient.first_name}, te recordamos tu cita en ${clinicName} el ${dateStr}. Por favor llega 10 minutos antes.`

    const results = {
        whatsapp: null as any,
        email: null as any
    }

    // Send WhatsApp if phone exists
    if (patient.phone) {
        // Simple formatting for example, assuming input is close to E.164 or needs cleaning
        // Triggering the library
        results.whatsapp = await sendWhatsAppMessage(patient.phone, messageBody)
    }

    // Send Email if email exists
    if (patient.email) {
        const html = `
            <h1>Recordatorio de Cita</h1>
            <p>${messageBody}</p>
            <p>Si deseas reprogramar, contáctanos.</p>
        `
        results.email = await sendEmail(patient.email, `Recordatorio Cita - ${clinicName}`, html)
    }

    return { success: true, results }
}

export async function resendAppointmentConfirmation(appointmentId: string) {
    const supabase = await createClient()

    // Fetch appointment with patient and clinic details
    const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
            *,
            patients (
                first_name,
                last_name,
                email,
                phone
            ),
            clinics (
                name
            ),
            services (
                name
            )
        `)
        .eq('id', appointmentId)
        .single()

    if (error || !appointment) {
        console.error('Error fetching appointment:', error)
        return { success: false, error: 'Cita no encontrada' }
    }

    const patient = appointment.patients
    if (!patient) return { success: false, error: 'Paciente no encontrado' }

    const clinicName = appointment.clinics?.name || 'Clínica'
    const serviceName = appointment.services?.name || 'Consulta'
    const dateStr = format(new Date(appointment.start_time), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })

    const messageBody = `Hola ${patient.first_name}, confirmamos tu cita de ${serviceName} en ${clinicName} el ${dateStr}. ¡Te esperamos!`

    const results = {
        whatsapp: null as any,
        email: null as any
    }

    // Send WhatsApp if phone exists
    if (patient.phone) {
        results.whatsapp = await sendWhatsAppMessage(patient.phone, messageBody)
    }

    // Send Email if email exists
    if (patient.email) {
        const html = `
            <h1>Confirmación de Cita</h1>
            <p><strong>Paciente:</strong> ${patient.first_name} ${patient.last_name}</p>
            <p><strong>Servicio:</strong> ${serviceName}</p>
            <p><strong>Fecha y Hora:</strong> ${dateStr}</p>
            <p><strong>Clínica:</strong> ${clinicName}</p>
            <hr>
            <p>Si necesitas reprogramar o cancelar, contáctanos.</p>
        `
        results.email = await sendEmail(patient.email, `Confirmación de Cita - ${clinicName}`, html)
    }

    return { success: true, results }
}

export async function testNotificationSetup() {
    // Test if notification services are configured
    const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    const resendConfigured = !!process.env.RESEND_API_KEY

    return {
        whatsapp: twilioConfigured,
        email: resendConfigured,
        configured: twilioConfigured || resendConfigured
    }
}

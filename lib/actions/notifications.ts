'use server'

import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp'
import { sendEmail } from '@/lib/notifications/email'
import { getBrandedEmailHtml } from '@/lib/notifications/email-template'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function sendAppointmentReminder(appointmentId: string) {
    const supabase = await createClient()

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
                name,
                whatsapp_phone_number_id
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

    const clinicName = (appointment.clinics as any)?.name || 'Clínica'
    const clinicPhoneNumberId = (appointment.clinics as any)?.whatsapp_phone_number_id || undefined
    const dateStr = format(new Date(appointment.start_time), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })

    const messageBody = `*${clinicName}*\n\nHola ${patient.first_name}, te recordamos tu cita el ${dateStr}. Por favor llega 10 minutos antes.`

    const results: { whatsapp: unknown; email: unknown } = {
        whatsapp: null,
        email: null
    }

    if (patient.phone) {
        results.whatsapp = await sendWhatsAppMessage(patient.phone, messageBody, clinicPhoneNumberId)
    }

    // Send Email if email exists
    if (patient.email) {
        const htmlContent = `
            <h2>Recordatorio de Cita</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                ${messageBody}
            </p>
            <p style="font-size: 15px; color: #64748b; margin-top: 32px;">
                Si deseas reprogramar o tienes algún contratiempo, por favor contáctanos lo antes posible.
            </p>
        `
        const fullHtml = getBrandedEmailHtml(`Recordatorio Cita - ${clinicName}`, htmlContent, clinicName)
        results.email = await sendEmail(patient.email, `Recordatorio Cita - ${clinicName}`, fullHtml)
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
                name,
                whatsapp_phone_number_id
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

    const clinicName = (appointment.clinics as any)?.name || 'Clínica'
    const clinicPhoneNumberId = (appointment.clinics as any)?.whatsapp_phone_number_id || undefined
    const serviceName = (appointment.services as any)?.name || 'Consulta'
    const dateStr = format(new Date(appointment.start_time), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })

    const messageBody = `*${clinicName}*\n\nHola ${patient.first_name}, confirmamos tu cita de ${serviceName} el ${dateStr}. ¡Te esperamos!`

    const results: { whatsapp: unknown; email: unknown } = {
        whatsapp: null,
        email: null
    }

    if (patient.phone) {
        results.whatsapp = await sendWhatsAppMessage(patient.phone, messageBody, clinicPhoneNumberId)
    }

    // Send Email if email exists
    if (patient.email) {
        const htmlContent = `
            <h2>Confirmación de Cita</h2>
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0 0 10px; font-size: 16px;"><strong>Paciente:</strong> <span style="color: #475569;">${patient.first_name} ${patient.last_name}</span></p>
                <p style="margin: 0 0 10px; font-size: 16px;"><strong>Tratamiento:</strong> <span style="color: #475569;">${serviceName}</span></p>
                <p style="margin: 0 0 10px; font-size: 16px;"><strong>Fecha y Hora:</strong> <span style="color: #475569;">${dateStr}</span></p>
                <p style="margin: 0; font-size: 16px;"><strong>Clínica:</strong> <span style="color: #475569;">${clinicName}</span></p>
            </div>
            <p style="font-size: 15px; color: #64748b; margin-top: 24px;">
                El equipo de ${clinicName} está listo para recibirte. Si necesitas reprogramar o cancelar tu cita, contáctanos cuanto antes. ¡Te esperamos!
            </p>
        `
        const fullHtml = getBrandedEmailHtml(`Confirmación de Cita - ${clinicName}`, htmlContent, clinicName)
        results.email = await sendEmail(patient.email, `Confirmación de Cita - ${clinicName}`, fullHtml)
    }

    return { success: true, results }
}

export async function testNotificationSetup() {
    const whatsappConfigured = !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
    const resendConfigured = !!process.env.RESEND_API_KEY

    return {
        whatsapp: whatsappConfigured,
        email: resendConfigured,
        configured: whatsappConfigured || resendConfigured
    }
}

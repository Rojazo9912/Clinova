import twilio from 'twilio'
import { Resend } from 'resend'

// Initialize clients lazily
let twilioClient: twilio.Twilio | null = null
let resendClient: Resend | null = null

function getTwilioClient() {
    if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        )
    }
    return twilioClient
}

function getResendClient() {
    if (!resendClient && process.env.RESEND_API_KEY) {
        resendClient = new Resend(process.env.RESEND_API_KEY)
    }
    return resendClient
}

interface AppointmentNotification {
    patientName: string
    patientPhone?: string
    patientEmail?: string
    clinicName: string
    appointmentDate: Date
    serviceName: string
    confirmationToken?: string
}

export async function sendAppointmentReminder(data: AppointmentNotification) {
    const results = {
        whatsapp: false,
        email: false,
        errors: [] as string[]
    }

    // Format date
    const dateStr = data.appointmentDate.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    const timeStr = data.appointmentDate.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    })

    // Send WhatsApp
    if (data.patientPhone) {
        try {
            const client = getTwilioClient()
            if (client && process.env.TWILIO_WHATSAPP_FROM) {
                let message = `Hola ${data.patientName}! 👋\n\nTe recordamos tu cita en ${data.clinicName}:\n\n📅 ${dateStr}\n⏰ ${timeStr}\n🏥 ${data.serviceName}`

                if (data.confirmationToken) {
                    // Use standard link instead of button
                    const confirmLink = `https://clinova-v2.up.railway.app/citas/confirmar/${data.confirmationToken}`
                    message += `\n\nCONFIRMA TU ASISTENCIA AQUÍ:\n${confirmLink}`
                }

                message += `\n\nNos vemos pronto!`

                await client.messages.create({
                    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
                    to: `whatsapp:${data.patientPhone}`,
                    body: message
                })
                results.whatsapp = true
            }
        } catch (error) {
            console.error('WhatsApp error:', error)
            results.errors.push(`WhatsApp: ${error}`)
        }
    }

    // Send Email
    if (data.patientEmail) {
        try {
            const client = getResendClient()
            if (client && process.env.RESEND_FROM_EMAIL) {
                await client.emails.send({
                    from: process.env.RESEND_FROM_EMAIL,
                    to: data.patientEmail,
                    subject: `Recordatorio de cita - ${data.clinicName}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2563eb;">Recordatorio de Cita</h2>
                            <p>Hola <strong>${data.patientName}</strong>,</p>
                            <p>Te recordamos tu próxima cita:</p>
                            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${dateStr}</p>
                                <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${timeStr}</p>
                                <p style="margin: 5px 0;"><strong>🏥 Servicio:</strong> ${data.serviceName}</p>
                                <p style="margin: 5px 0;"><strong>📍 Clínica:</strong> ${data.clinicName}</p>
                            </div>
                            <p>¡Nos vemos pronto!</p>
                            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                                Este es un mensaje automático de ${data.clinicName}
                            </p>
                        </div>
                    `
                })
                results.email = true
            }
        } catch (error) {
            console.error('Email error:', error)
            results.errors.push(`Email: ${error}`)
        }
    }

    return results
}

export async function sendAppointmentConfirmation(data: AppointmentNotification) {
    const results = {
        whatsapp: false,
        email: false,
        errors: [] as string[]
    }

    const dateStr = data.appointmentDate.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    const timeStr = data.appointmentDate.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    })

    // Send WhatsApp
    if (data.patientPhone) {
        try {
            const client = getTwilioClient()
            if (client && process.env.TWILIO_WHATSAPP_FROM) {
                const message = `¡Cita confirmada! ✅\n\nHola ${data.patientName}, tu cita ha sido confirmada:\n\n📅 ${dateStr}\n⏰ ${timeStr}\n🏥 ${data.serviceName}\n\nGracias por confiar en ${data.clinicName}!`

                await client.messages.create({
                    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
                    to: `whatsapp:${data.patientPhone}`,
                    body: message
                })
                results.whatsapp = true
            }
        } catch (error) {
            console.error('WhatsApp error:', error)
            results.errors.push(`WhatsApp: ${error}`)
        }
    }

    // Send Email
    if (data.patientEmail) {
        try {
            const client = getResendClient()
            if (client && process.env.RESEND_FROM_EMAIL) {
                await client.emails.send({
                    from: process.env.RESEND_FROM_EMAIL,
                    to: data.patientEmail,
                    subject: `Cita confirmada - ${data.clinicName}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #10b981;">✅ Cita Confirmada</h2>
                            <p>Hola <strong>${data.patientName}</strong>,</p>
                            <p>Tu cita ha sido confirmada exitosamente:</p>
                            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${dateStr}</p>
                                <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${timeStr}</p>
                                <p style="margin: 5px 0;"><strong>🏥 Servicio:</strong> ${data.serviceName}</p>
                                <p style="margin: 5px 0;"><strong>📍 Clínica:</strong> ${data.clinicName}</p>
                            </div>
                            <p>¡Gracias por confiar en nosotros!</p>
                            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                                Este es un mensaje automático de ${data.clinicName}
                            </p>
                        </div>
                    `
                })
                results.email = true
            }
        } catch (error) {
            console.error('Email error:', error)
            results.errors.push(`Email: ${error}`)
        }
    }

    return results
}

export async function sendPaymentReceipt(data: {
    patientName: string
    patientEmail?: string
    clinicName: string
    amount: number
    paymentMethod: string
    paymentDate: Date
}) {
    try {
        const client = getResendClient()
        if (!client || !process.env.RESEND_FROM_EMAIL || !data.patientEmail) {
            return { success: false, error: 'Email not configured or missing' }
        }

        const dateStr = data.paymentDate.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        await client.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to: data.patientEmail,
            subject: `Recibo de pago - ${data.clinicName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Recibo de Pago</h2>
                    <p>Hola <strong>${data.patientName}</strong>,</p>
                    <p>Hemos recibido tu pago:</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>💰 Monto:</strong> $${data.amount.toLocaleString()}</p>
                        <p style="margin: 5px 0;"><strong>💳 Método:</strong> ${data.paymentMethod}</p>
                        <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${dateStr}</p>
                    </div>
                    <p>¡Gracias por tu pago!</p>
                    <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                        ${data.clinicName}
                    </p>
                </div>
            `
        })

        return { success: true }
    } catch (error) {
        console.error('Payment receipt error:', error)
        return { success: false, error: String(error) }
    }
}

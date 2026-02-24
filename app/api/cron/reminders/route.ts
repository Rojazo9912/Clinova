import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp'
import { sendEmail } from '@/lib/notifications/email'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const results: any[] = []
        const now = new Date()
        const currentHour = now.getHours()

        // Get all clinics with their reminder settings
        const { data: clinics } = await supabase
            .from('clinics')
            .select(`
                id,
                name,
                reminder_settings (
                    reminder_times,
                    send_start_hour,
                    send_end_hour,
                    whatsapp_enabled,
                    email_enabled
                )
            `)

        for (const clinic of clinics || []) {
            const settings = (clinic.reminder_settings as any)?.[0]
            if (!settings) continue

            // Check if we're within sending hours
            if (currentHour < settings.send_start_hour || currentHour >= settings.send_end_hour) {
                console.log(`Skipping clinic ${clinic.id}: outside send window`)
                continue
            }

            // Get templates for this clinic
            const { data: templates } = await supabase
                .from('reminder_templates')
                .select('*')
                .eq('clinic_id', clinic.id)

            const whatsappTemplate = templates?.find(t => t.template_type === 'whatsapp_reminder')
            const emailTemplate = templates?.find(t => t.template_type === 'email_reminder')

            // Process each reminder time
            for (const hoursBefor of settings.reminder_times || [24]) {
                const targetTime = new Date(now)
                targetTime.setHours(targetTime.getHours() + hoursBefor)

                // Get appointments for this time window (±30 minutes)
                const windowStart = new Date(targetTime)
                windowStart.setMinutes(windowStart.getMinutes() - 30)
                const windowEnd = new Date(targetTime)
                windowEnd.setMinutes(windowEnd.getMinutes() + 30)

                const { data: appointments } = await supabase
                    .from('appointments')
                    .select(`
                        id,
                        start_time,
                        confirmation_token,
                        patients!inner (
                            id,
                            first_name,
                            last_name,
                            phone,
                            email,
                            reminders_enabled
                        ),
                        services (
                            name
                        )
                    `)
                    .eq('clinic_id', clinic.id)
                    .eq('status', 'confirmed')
                    .gte('start_time', windowStart.toISOString())
                    .lte('start_time', windowEnd.toISOString())

                for (const apt of appointments || []) {
                    const patient = apt.patients as any
                    const service = apt.services as any

                    // Skip if patient has reminders disabled
                    if (!patient.reminders_enabled) {
                        await logReminder(supabase, {
                            appointment_id: apt.id,
                            patient_id: patient.id,
                            clinic_id: clinic.id,
                            reminder_type: 'skipped',
                            hours_before: hoursBefor,
                            status: 'skipped',
                            error_message: 'Patient has reminders disabled'
                        })
                        continue
                    }

                    // Check if reminder already sent for this time
                    const { data: existingLog } = await supabase
                        .from('reminder_logs')
                        .select('id')
                        .eq('appointment_id', apt.id)
                        .eq('hours_before', hoursBefor)
                        .single()

                    if (existingLog) {
                        console.log(`Reminder already sent for appointment ${apt.id} at ${hoursBefor}h`)
                        continue
                    }

                    // Prepare variables for template
                    const variables = {
                        patient_name: `${patient.first_name} ${patient.last_name}`,
                        date: format(new Date(apt.start_time), "EEEE, d 'de' MMMM", { locale: es }),
                        time: format(new Date(apt.start_time), 'HH:mm'),
                        service: service?.name || 'Consulta',
                        clinic_name: clinic.name,
                        hours_before: hoursBefor.toString()
                    }

                    // Send WhatsApp
                    if (settings.whatsapp_enabled && patient.phone && whatsappTemplate) {
                        try {
                            let message = replaceVariables(whatsappTemplate.message, variables)

                            // Append confirmation link if token exists
                            if (apt.confirmation_token) {
                                message += `\n\nCONFIRMA TU ASISTENCIA AQUÍ:\nhttps://clinova-v2.up.railway.app/citas/confirmar/${apt.confirmation_token}`
                            }

                            await sendWhatsAppMessage(patient.phone, message)

                            await logReminder(supabase, {
                                appointment_id: apt.id,
                                patient_id: patient.id,
                                clinic_id: clinic.id,
                                reminder_type: 'whatsapp',
                                hours_before: hoursBefor,
                                status: 'sent'
                            })

                            results.push({
                                type: 'whatsapp',
                                patient: variables.patient_name,
                                hours_before: hoursBefor,
                                status: 'sent'
                            })
                        } catch (error: any) {
                            await logReminder(supabase, {
                                appointment_id: apt.id,
                                patient_id: patient.id,
                                clinic_id: clinic.id,
                                reminder_type: 'whatsapp',
                                hours_before: hoursBefor,
                                status: 'failed',
                                error_message: error.message
                            })
                        }
                    }

                    // Send Email
                    if (settings.email_enabled && patient.email && emailTemplate) {
                        try {
                            const subject = replaceVariables(emailTemplate.subject || 'Recordatorio de Cita', variables)
                            const message = replaceVariables(emailTemplate.message, variables)

                            await sendEmail(
                                patient.email,
                                subject,
                                message.replace(/\n/g, '<br>')
                            )

                            await logReminder(supabase, {
                                appointment_id: apt.id,
                                patient_id: patient.id,
                                clinic_id: clinic.id,
                                reminder_type: 'email',
                                hours_before: hoursBefor,
                                status: 'sent'
                            })

                            results.push({
                                type: 'email',
                                patient: variables.patient_name,
                                hours_before: hoursBefor,
                                status: 'sent'
                            })
                        } catch (error: any) {
                            await logReminder(supabase, {
                                appointment_id: apt.id,
                                patient_id: patient.id,
                                clinic_id: clinic.id,
                                reminder_type: 'email',
                                hours_before: hoursBefor,
                                status: 'failed',
                                error_message: error.message
                            })
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            reminders_sent: results.length,
            results
        })
    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

function replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }
    return result
}

async function logReminder(supabase: any, data: {
    appointment_id: string
    patient_id: string
    clinic_id: string
    reminder_type: string
    hours_before: number
    status: string
    error_message?: string
}) {
    await supabase.from('reminder_logs').insert(data)
}

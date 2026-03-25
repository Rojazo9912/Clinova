import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp'
import { sendEmail } from '@/lib/notifications/email'
import { getBrandedEmailHtml } from '@/lib/notifications/email-template'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        // Validate CRON_SECRET is configured before comparing
        if (!process.env.CRON_SECRET) {
            console.error('CRON_SECRET is not configured')
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
        }

        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const results: any[] = []
        const now = new Date()
        const currentHour = now.getHours()

        // Query 1: all clinics with their reminder settings
        const { data: clinics } = await supabase
            .from('clinics')
            .select(`
                id,
                name,
                whatsapp_phone_number_id,
                reminder_settings (
                    reminder_times,
                    send_start_hour,
                    send_end_hour,
                    whatsapp_enabled,
                    email_enabled
                )
            `)

        // Keep only clinics within their send window
        const activeClinics = (clinics || []).filter(clinic => {
            const settings = (clinic.reminder_settings as any)?.[0]
            if (!settings) return false
            return currentHour >= settings.send_start_hour && currentHour < settings.send_end_hour
        })

        if (activeClinics.length === 0) {
            return NextResponse.json({ success: true, reminders_sent: 0, results: [] })
        }

        // Query 2: all reminder templates for active clinics (single query, not per-clinic)
        const activeClinicIds = activeClinics.map(c => c.id)
        const { data: allTemplates } = await supabase
            .from('reminder_templates')
            .select('*')
            .in('clinic_id', activeClinicIds)

        const templateMap = new Map<string, any>()
        for (const t of allTemplates || []) {
            templateMap.set(`${t.clinic_id}:${t.template_type}`, t)
        }

        // Process each active clinic with a single appointment query per clinic
        // (covers all reminder windows for that clinic, routed in memory)
        for (const clinic of activeClinics) {
            const settings = (clinic.reminder_settings as any)?.[0]
            const whatsappTemplate = templateMap.get(`${clinic.id}:whatsapp_reminder`)
            const emailTemplate = templateMap.get(`${clinic.id}:email_reminder`)

            // Compute all windows for this clinic
            type Window = { hoursBefore: number; windowStart: Date; windowEnd: Date }
            const windows: Window[] = (settings.reminder_times || [24]).map((hoursBefore: number) => {
                const targetTime = new Date(now)
                targetTime.setHours(targetTime.getHours() + hoursBefore)
                const windowStart = new Date(targetTime)
                windowStart.setMinutes(windowStart.getMinutes() - 30)
                const windowEnd = new Date(targetTime)
                windowEnd.setMinutes(windowEnd.getMinutes() + 30)
                return { hoursBefore, windowStart, windowEnd }
            })

            // Single appointment query covering the full span of all windows for this clinic
            const minStart = new Date(Math.min(...windows.map(w => w.windowStart.getTime())))
            const maxEnd = new Date(Math.max(...windows.map(w => w.windowEnd.getTime())))

            const { data: allAppointments } = await supabase
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
                .gte('start_time', minStart.toISOString())
                .lte('start_time', maxEnd.toISOString())

            // Route appointments to their matching window in memory
            for (const { hoursBefore, windowStart, windowEnd } of windows) {
                const appointments = (allAppointments || []).filter(apt => {
                    const t = new Date(apt.start_time).getTime()
                    return t >= windowStart.getTime() && t <= windowEnd.getTime()
                })

                for (const apt of appointments) {
                    const patient = apt.patients as any
                    const service = apt.services as any

                    // Skip if patient has reminders disabled
                    if (!patient.reminders_enabled) {
                        await logReminder(supabase, {
                            appointment_id: apt.id,
                            patient_id: patient.id,
                            clinic_id: clinic.id,
                            reminder_type: 'skipped',
                            hours_before: hoursBefore,
                            status: 'skipped',
                            error_message: 'Patient has reminders disabled'
                        })
                        continue
                    }

                    // Check if reminder already sent for this appointment + window
                    const { data: existingLog } = await supabase
                        .from('reminder_logs')
                        .select('id')
                        .eq('appointment_id', apt.id)
                        .eq('hours_before', hoursBefore)
                        .single()

                    if (existingLog) {
                        console.log(`Reminder already sent for appointment ${apt.id} at ${hoursBefore}h`)
                        continue
                    }

                    const variables = {
                        patient_name: `${patient.first_name} ${patient.last_name}`,
                        date: format(new Date(apt.start_time), "EEEE, d 'de' MMMM", { locale: es }),
                        time: format(new Date(apt.start_time), 'HH:mm'),
                        service: service?.name || 'Consulta',
                        clinic_name: clinic.name,
                        hours_before: hoursBefore.toString()
                    }

                    // Send WhatsApp
                    if (settings.whatsapp_enabled && patient.phone && whatsappTemplate) {
                        try {
                            let message = replaceVariables(whatsappTemplate.message, variables)

                            if (apt.confirmation_token) {
                                const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://axomed.com.mx').replace(/\/$/, '')
                                message += `\n\nCONFIRMA TU ASISTENCIA AQUÍ:\n${appUrl}/citas/confirmar/${apt.confirmation_token}`
                            }

                            await sendWhatsAppMessage(patient.phone, message, (clinic as any).whatsapp_phone_number_id || undefined)

                            await logReminder(supabase, {
                                appointment_id: apt.id,
                                patient_id: patient.id,
                                clinic_id: clinic.id,
                                reminder_type: 'whatsapp',
                                hours_before: hoursBefore,
                                status: 'sent'
                            })

                            results.push({ type: 'whatsapp', patient: variables.patient_name, hours_before: hoursBefore, status: 'sent' })
                        } catch (error: any) {
                            await logReminder(supabase, {
                                appointment_id: apt.id,
                                patient_id: patient.id,
                                clinic_id: clinic.id,
                                reminder_type: 'whatsapp',
                                hours_before: hoursBefore,
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
                            const formattedMessage = message.replace(/\n/g, '<br>')
                            const htmlContent = `
                                <h2>Recordatorio</h2>
                                <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
                                    ${formattedMessage}
                                </p>
                            `
                            const fullHtml = getBrandedEmailHtml(subject, htmlContent, clinic.name)

                            await sendEmail(patient.email, subject, fullHtml)

                            await logReminder(supabase, {
                                appointment_id: apt.id,
                                patient_id: patient.id,
                                clinic_id: clinic.id,
                                reminder_type: 'email',
                                hours_before: hoursBefore,
                                status: 'sent'
                            })

                            results.push({ type: 'email', patient: variables.patient_name, hours_before: hoursBefore, status: 'sent' })
                        } catch (error: any) {
                            await logReminder(supabase, {
                                appointment_id: apt.id,
                                patient_id: patient.id,
                                clinic_id: clinic.id,
                                reminder_type: 'email',
                                hours_before: hoursBefore,
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

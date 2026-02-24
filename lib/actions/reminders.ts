'use server'

import { createClient } from '@/lib/supabase/server'

export async function getReminderSettings() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return null

    const { data: settings } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .single()

    return settings
}

export async function updateReminderSettings(data: {
    reminder_times: number[]
    send_start_hour: number
    send_end_hour: number
    whatsapp_enabled: boolean
    email_enabled: boolean
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
        .from('reminder_settings')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('clinic_id', profile.clinic_id)

    if (error) throw error

    return { success: true }
}

export async function getReminderTemplates() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const { data: templates } = await supabase
        .from('reminder_templates')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .order('template_type')

    return templates || []
}

export async function updateReminderTemplate(templateType: string, data: {
    subject?: string
    message: string
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
        .from('reminder_templates')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('clinic_id', profile.clinic_id)
        .eq('template_type', templateType)

    if (error) throw error

    return { success: true }
}

export async function togglePatientReminders(patientId: string, enabled: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('patients')
        .update({ reminders_enabled: enabled })
        .eq('id', patientId)

    if (error) throw error

    return { success: true }
}

export async function getReminderLogs(limit: number = 50) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const { data: logs } = await supabase
        .from('reminder_logs')
        .select(`
            *,
            patients(first_name, last_name),
            appointments(start_time)
        `)
        .eq('clinic_id', profile.clinic_id)
        .order('sent_at', { ascending: false })
        .limit(limit)

    return logs || []
}

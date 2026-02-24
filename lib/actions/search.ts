'use server'

import { createClient } from '@/lib/supabase/server'

interface SearchResult {
    type: 'patient' | 'appointment' | 'payment' | 'session'
    id: string
    title: string
    subtitle: string
    href: string
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const results: SearchResult[] = []
    const searchTerm = `%${query.toLowerCase()}%`

    // Search patients
    const { data: patients } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email, phone')
        .eq('clinic_id', profile.clinic_id)
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`)
        .limit(5)

    if (patients) {
        results.push(...patients.map(p => ({
            type: 'patient' as const,
            id: p.id,
            title: `${p.first_name} ${p.last_name}`,
            subtitle: p.email || p.phone || 'Sin contacto',
            href: `/dashboard/patients/${p.id}`
        })))
    }

    // Search appointments
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            id,
            start_time,
            status,
            patients (
                first_name,
                last_name
            ),
            services (
                name
            )
        `)
        .eq('clinic_id', profile.clinic_id)
        .limit(5)

    if (appointments) {
        results.push(...appointments
            .filter(apt => {
                const patientName = `${(apt.patients as any)?.first_name} ${(apt.patients as any)?.last_name}`.toLowerCase()
                const serviceName = ((apt.services as any)?.name || '').toLowerCase()
                return patientName.includes(query.toLowerCase()) || serviceName.includes(query.toLowerCase())
            })
            .map(apt => ({
                type: 'appointment' as const,
                id: apt.id,
                title: `Cita - ${(apt.patients as any)?.first_name} ${(apt.patients as any)?.last_name}`,
                subtitle: `${(apt.services as any)?.name || 'Consulta'} - ${new Date(apt.start_time).toLocaleDateString()}`,
                href: `/dashboard/agenda`
            })))
    }

    // Search payments
    const { data: payments } = await supabase
        .from('payments')
        .select(`
            id,
            amount,
            payment_method,
            created_at,
            patients (
                first_name,
                last_name
            )
        `)
        .eq('clinic_id', profile.clinic_id)
        .limit(5)

    if (payments) {
        results.push(...payments
            .filter(p => {
                const patientName = `${(p.patients as any)?.first_name} ${(p.patients as any)?.last_name}`.toLowerCase()
                return patientName.includes(query.toLowerCase())
            })
            .map(p => ({
                type: 'payment' as const,
                id: p.id,
                title: `Pago - ${(p.patients as any)?.first_name} ${(p.patients as any)?.last_name}`,
                subtitle: `$${Number(p.amount).toLocaleString()} - ${p.payment_method}`,
                href: `/dashboard/finance`
            })))
    }

    // Search therapy sessions
    const { data: sessions } = await supabase
        .from('therapy_sessions')
        .select(`
            id,
            session_date,
            notes,
            patients (
                first_name,
                last_name
            )
        `)
        .eq('clinic_id', profile.clinic_id)
        .limit(5)

    if (sessions) {
        results.push(...sessions
            .filter(s => {
                const patientName = `${(s.patients as any)?.first_name} ${(s.patients as any)?.last_name}`.toLowerCase()
                const notes = (s.notes || '').toLowerCase()
                return patientName.includes(query.toLowerCase()) || notes.includes(query.toLowerCase())
            })
            .map(s => ({
                type: 'session' as const,
                id: s.id,
                title: `Sesión - ${(s.patients as any)?.first_name} ${(s.patients as any)?.last_name}`,
                subtitle: `${new Date(s.session_date).toLocaleDateString()}`,
                href: `/dashboard/emr`
            })))
    }

    // Sort by relevance (patients first, then by date)
    return results.slice(0, 10)
}

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

    // Search appointments — filter by patient name at DB level
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            id,
            start_time,
            status,
            patients!inner (
                first_name,
                last_name
            ),
            services (
                name
            )
        `)
        .eq('clinic_id', profile.clinic_id)
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`, { referencedTable: 'patients' })
        .limit(5)

    if (appointments) {
        results.push(...appointments.map(apt => ({
            type: 'appointment' as const,
            id: apt.id,
            title: `Cita - ${(apt.patients as any)?.first_name} ${(apt.patients as any)?.last_name}`,
            subtitle: `${(apt.services as any)?.name || 'Consulta'} - ${new Date(apt.start_time).toLocaleDateString()}`,
            href: `/dashboard/agenda`
        })))
    }

    // Search payments — filter by patient name at DB level
    const { data: payments } = await supabase
        .from('payments')
        .select(`
            id,
            amount,
            payment_method,
            created_at,
            patients!inner (
                first_name,
                last_name
            )
        `)
        .eq('clinic_id', profile.clinic_id)
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`, { referencedTable: 'patients' })
        .limit(5)

    if (payments) {
        results.push(...payments.map(p => ({
            type: 'payment' as const,
            id: p.id,
            title: `Pago - ${(p.patients as any)?.first_name} ${(p.patients as any)?.last_name}`,
            subtitle: `$${Number(p.amount).toLocaleString()} - ${p.payment_method}`,
            href: `/dashboard/finance`
        })))
    }

    // Search therapy sessions — two queries to correctly OR across base table (notes) and joined table (patient name)
    const [{ data: sessionsByNotes }, { data: sessionsByPatient }] = await Promise.all([
        supabase
            .from('therapy_sessions')
            .select(`id, session_date, notes, patients ( first_name, last_name )`)
            .eq('clinic_id', profile.clinic_id)
            .ilike('notes', searchTerm)
            .limit(5),
        supabase
            .from('therapy_sessions')
            .select(`id, session_date, notes, patients!inner ( first_name, last_name )`)
            .eq('clinic_id', profile.clinic_id)
            .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`, { referencedTable: 'patients' })
            .limit(5),
    ])

    // Merge and deduplicate by id
    const seenSessionIds = new Set<string>()
    const sessions = [...(sessionsByNotes || []), ...(sessionsByPatient || [])].filter(s => {
        if (seenSessionIds.has(s.id)) return false
        seenSessionIds.add(s.id)
        return true
    })

    results.push(...sessions.slice(0, 5).map(s => ({
        type: 'session' as const,
        id: s.id,
        title: `Sesión - ${(s.patients as any)?.first_name} ${(s.patients as any)?.last_name}`,
        subtitle: `${new Date(s.session_date).toLocaleDateString()}`,
        href: `/dashboard/emr`
    })))

    // Sort by relevance (patients first, then by date)
    return results.slice(0, 10)
}

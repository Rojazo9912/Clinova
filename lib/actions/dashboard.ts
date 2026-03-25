'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, subDays, format } from 'date-fns'

export async function getDashboardMetrics() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.clinic_id) return null

    const clinicId = profile.clinic_id

    // Get current month dates
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Run all 8 queries in parallel
    const [
        { count: totalPatients },
        { count: newPatientsThisMonth },
        { count: newPatientsLastMonth },
        { data: paymentsThisMonth },
        { data: paymentsLastMonth },
        { count: appointmentsToday },
        { count: appointmentsThisMonth },
        { count: appointmentsLastMonth },
    ] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).gte('created_at', monthStart.toISOString()).lte('created_at', monthEnd.toISOString()),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString()),
        supabase.from('payments').select('amount').eq('clinic_id', clinicId).eq('status', 'completed').gte('created_at', monthStart.toISOString()).lte('created_at', monthEnd.toISOString()),
        supabase.from('payments').select('amount').eq('clinic_id', clinicId).eq('status', 'completed').gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString()),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).gte('start_time', today.toISOString()).lt('start_time', tomorrow.toISOString()),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).gte('start_time', monthStart.toISOString()).lte('start_time', monthEnd.toISOString()),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId).gte('start_time', lastMonthStart.toISOString()).lte('start_time', lastMonthEnd.toISOString()),
    ])

    const revenueThisMonth = paymentsThisMonth?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
    const revenueLastMonth = paymentsLastMonth?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    // Calculate changes
    const patientChange = newPatientsLastMonth ?
        ((newPatientsThisMonth || 0) - newPatientsLastMonth) / newPatientsLastMonth * 100 : 0

    const revenueChange = revenueLastMonth ?
        (revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100 : 0

    const appointmentChange = appointmentsLastMonth ?
        ((appointmentsThisMonth || 0) - appointmentsLastMonth) / appointmentsLastMonth * 100 : 0

    return {
        totalPatients: totalPatients || 0,
        newPatients: newPatientsThisMonth || 0,
        patientChange: Math.round(patientChange),
        revenue: revenueThisMonth,
        revenueChange: Math.round(revenueChange),
        appointmentsToday: appointmentsToday || 0,
        appointmentsThisMonth: appointmentsThisMonth || 0,
        appointmentChange: Math.round(appointmentChange)
    }
}

export async function getRevenueChartData() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.clinic_id) return []

    // Fetch all payments from the last 6 months in a single query, group in memory
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5))

    const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'completed')
        .gte('created_at', sixMonthsAgo.toISOString())

    // Build month buckets from the result set
    const revenueByMonth: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
        const key = format(subMonths(new Date(), i), 'yyyy-MM')
        revenueByMonth[key] = 0
    }

    for (const p of payments || []) {
        const key = format(new Date(p.created_at), 'yyyy-MM')
        if (key in revenueByMonth) {
            revenueByMonth[key] += Number(p.amount)
        }
    }

    return Object.entries(revenueByMonth).map(([key, revenue]) => ({
        date: format(new Date(key + '-01'), 'MMM'),
        revenue
    }))
}

export async function getTodayAppointments() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.clinic_id) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            id,
            start_time,
            status,
            patients (
                id,
                first_name,
                last_name
            ),
            services (
                name
            )
        `)
        .eq('clinic_id', profile.clinic_id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .order('start_time')

    return appointments?.map(apt => {
        const p = apt.patients as unknown as { id: string; first_name: string; last_name: string } | null
        const s = apt.services as unknown as { name: string } | null
        return {
            id: apt.id,
            patient_id: p?.id ?? null,
            patient_name: p ? `${p.first_name} ${p.last_name}`.trim() : 'Sin paciente',
            service_name: s?.name ?? 'Consulta',
            start_time: apt.start_time,
            status: apt.status
        }
    }) || []
}

export async function getCurrentUserProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    return profile?.full_name ?? null
}

export async function getClinicName(): Promise<string> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return ''

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id, clinics(name)')
        .eq('id', user.id)
        .single()

    return (profile?.clinics as any)?.name ?? ''
}

export async function getBusinessAlerts() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.clinic_id) return null

    const clinicId = profile.clinic_id
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const thirtyDaysAgo = subDays(now, 30)

    // Pending collections: active plans with package_price > paid_amount
    const { data: activePlans } = await supabase
        .from('treatment_plans')
        .select('package_price, paid_amount')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .not('package_price', 'is', null)

    const pendingPlans = (activePlans || []).filter(
        p => Number(p.package_price) > Number(p.paid_amount)
    )
    const pendingAmount = pendingPlans.reduce(
        (sum, p) => sum + (Number(p.package_price) - Number(p.paid_amount)), 0
    )

    // Inactive patients: patients with no session in last 30 days
    const [{ count: totalPatients }, { data: recentSessions }] = await Promise.all([
        supabase
            .from('patients')
            .select('id', { count: 'exact', head: true })
            .eq('clinic_id', clinicId),
        supabase
            .from('therapy_sessions')
            .select('patient_id')
            .eq('clinic_id', clinicId)
            .gte('session_date', thirtyDaysAgo.toISOString())
    ])

    const activePatientIds = new Set((recentSessions || []).map(s => s.patient_id))
    const inactivePatients = Math.max(0, (totalPatients || 0) - activePatientIds.size)

    // Completion rate: completed / total non-cancelled appointments this month
    const [{ count: completedThisMonth }, { count: scheduledThisMonth }] = await Promise.all([
        supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('clinic_id', clinicId)
            .eq('status', 'completed')
            .gte('start_time', monthStart.toISOString())
            .lte('start_time', monthEnd.toISOString()),
        supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('clinic_id', clinicId)
            .neq('status', 'cancelled')
            .gte('start_time', monthStart.toISOString())
            .lte('start_time', monthEnd.toISOString())
    ])

    const completionRate = scheduledThisMonth
        ? Math.round(((completedThisMonth || 0) / scheduledThisMonth) * 100)
        : 0

    return {
        pendingAmount,
        pendingPlansCount: pendingPlans.length,
        inactivePatients,
        completionRate,
        scheduledThisMonth: scheduledThisMonth || 0,
    }
}

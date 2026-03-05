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

    // Total patients
    const { count: totalPatients } = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)

    // New patients this month
    const { count: newPatientsThisMonth } = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())

    const { count: newPatientsLastMonth } = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString())

    // Revenue this month
    const { data: paymentsThisMonth } = await supabase
        .from('payments')
        .select('amount')
        .eq('clinic_id', clinicId)
        .eq('status', 'completed')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())

    const { data: paymentsLastMonth } = await supabase
        .from('payments')
        .select('amount')
        .eq('clinic_id', clinicId)
        .eq('status', 'completed')
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString())

    const revenueThisMonth = paymentsThisMonth?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
    const revenueLastMonth = paymentsLastMonth?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    // Appointments today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { count: appointmentsToday } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())

    // Appointments this month
    const { count: appointmentsThisMonth } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString())

    const { count: appointmentsLastMonth } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('start_time', lastMonthStart.toISOString())
        .lte('start_time', lastMonthEnd.toISOString())

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

    // Get last 6 months of revenue
    const months = []
    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i)
        const start = startOfMonth(monthDate)
        const end = endOfMonth(monthDate)

        const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('clinic_id', profile.clinic_id)
            .eq('status', 'completed')
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())

        const revenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

        months.push({
            date: format(monthDate, 'MMM'),
            revenue
        })
    }

    return months
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

    return appointments?.map(apt => ({
        id: apt.id,
        patient_id: (apt.patients as any)?.id || null,
        patient_name: `${(apt.patients as any)?.first_name ?? ''} ${(apt.patients as any)?.last_name ?? ''}`.trim() || 'Sin paciente',
        service_name: (apt.services as any)?.name || 'Consulta',
        start_time: apt.start_time,
        status: apt.status
    })) || []
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

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getServices() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .eq('active', true)
        .order('name')

    if (error) {
        console.error('Error fetching services:', error)
        return []
    }

    return data || []
}

export async function createService(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const durationMinutes = parseInt(formData.get('duration_minutes') as string)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('Sin clínica asignada')

    const { error } = await supabase
        .from('services')
        .insert({
            clinic_id: profile.clinic_id,
            name,
            description,
            price,
            duration_minutes: durationMinutes
        })

    if (error) throw error

    revalidatePath('/dashboard/finance')
}

export async function updateService(id: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('Sin clínica asignada')

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const durationMinutes = parseInt(formData.get('duration_minutes') as string)

    const { error } = await supabase
        .from('services')
        .update({
            name,
            description,
            price,
            duration_minutes: durationMinutes
        })
        .eq('id', id)
        .eq('clinic_id', profile.clinic_id)

    if (error) throw error

    revalidatePath('/dashboard/finance')
}

export async function deleteService(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('Sin clínica asignada')

    // Soft delete — only if it belongs to the user's clinic
    const { error } = await supabase
        .from('services')
        .update({ active: false })
        .eq('id', id)
        .eq('clinic_id', profile.clinic_id)

    if (error) throw error

    revalidatePath('/dashboard/finance')
}

export async function getPayments(filters?: { startDate?: string; endDate?: string }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    let query = supabase
        .from('payments')
        .select('*, patients(first_name, last_name), services!payments_service_id_fkey(name)')
        .eq('clinic_id', profile.clinic_id)

    if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate)
    }

    if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching payments:', error)
        return []
    }

    return data || []
}

export async function recordPayment(formData: FormData) {
    const supabase = await createClient()

    const patientId = formData.get('patient_id') as string
    const serviceId = formData.get('service_id') as string
    const amount = parseFloat(formData.get('amount') as string)
    const paymentMethod = formData.get('payment_method') as string
    const notes = formData.get('notes') as string
    const treatmentPlanId = formData.get('treatment_plan_id') as string

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('Sin clínica asignada')

    // Use the record_payment RPC so the payment insert and plan balance update
    // execute in a single atomic transaction (migration: 20260325_record_payment_transaction.sql).
    const { error } = await supabase.rpc('record_payment', {
        p_clinic_id: profile.clinic_id,
        p_patient_id: patientId,
        p_service_id: serviceId || null,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_notes: notes || null,
        p_treatment_plan_id: treatmentPlanId || null,
    })

    if (error) throw new Error(`Error al registrar pago: ${error.message}`)

    revalidatePath('/dashboard/finance')
}

export async function getFinancialReport(startDate: string, endDate: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { total: 0, byMethod: {}, byService: {} }

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return { total: 0, byMethod: {}, byService: {} }

    const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_method, services!payments_service_id_fkey(name)')
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

    if (!payments) return { total: 0, byMethod: {}, byService: {} }

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    const byMethod = payments.reduce<Record<string, number>>((acc, p) => {
        acc[p.payment_method] = (acc[p.payment_method] || 0) + Number(p.amount)
        return acc
    }, {})

    const byService = payments.reduce<Record<string, number>>((acc, p) => {
        const serviceName = (p.services as unknown as { name: string } | null)?.name || 'Sin servicio'
        acc[serviceName] = (acc[serviceName] || 0) + Number(p.amount)
        return acc
    }, {})

    return { total, byMethod, byService }
}

export async function getPendingCollections() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const { data, error } = await supabase
        .from('treatment_plans')
        .select(`
            id,
            title,
            package_price,
            paid_amount,
            total_sessions,
            completed_sessions,
            patients (
                id,
                first_name,
                last_name
            )
        `)
        .eq('clinic_id', profile.clinic_id)
        .eq('status', 'active')
        .not('package_price', 'is', null)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching pending collections:', error)
        return []
    }

    return (data || [])
        .filter(plan => Number(plan.package_price) > Number(plan.paid_amount))
        .map(plan => ({
            id: plan.id,
            title: plan.title,
            patient_id: (plan.patients as unknown as { id: string } | null)?.id ?? '',
            patient_name: (() => { const p = plan.patients as unknown as { first_name: string; last_name: string } | null; return p ? `${p.first_name} ${p.last_name}`.trim() : '' })(),
            package_price: Number(plan.package_price),
            paid_amount: Number(plan.paid_amount),
            pending: Number(plan.package_price) - Number(plan.paid_amount),
            total_sessions: plan.total_sessions,
            completed_sessions: plan.completed_sessions,
        }))
}

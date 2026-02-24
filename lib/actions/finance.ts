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

    if (error) throw error

    revalidatePath('/dashboard/finance')
}

export async function deleteService(id: string) {
    const supabase = await createClient()

    // Soft delete
    const { error } = await supabase
        .from('services')
        .update({ active: false })
        .eq('id', id)

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

    const { error } = await supabase
        .from('payments')
        .insert({
            clinic_id: profile.clinic_id,
            patient_id: patientId,
            service_id: serviceId || null,
            amount,
            payment_method: paymentMethod,
            notes,
            status: 'completed'
        })

    if (error) throw error

    // Update treatment plan paid amount if linked
    if (treatmentPlanId) {
        const { data: plan } = await supabase
            .from('treatment_plans')
            .select('paid_amount')
            .eq('id', treatmentPlanId)
            .single()

        if (plan) {
            await supabase
                .from('treatment_plans')
                .update({ paid_amount: (Number(plan.paid_amount) || 0) + amount })
                .eq('id', treatmentPlanId)
        }
    }

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

    const byMethod = payments.reduce((acc: any, p) => {
        acc[p.payment_method] = (acc[p.payment_method] || 0) + Number(p.amount)
        return acc
    }, {})

    const byService = payments.reduce((acc: any, p) => {
        const serviceName = (p.services as any)?.name || 'Sin servicio'
        acc[serviceName] = (acc[serviceName] || 0) + Number(p.amount)
        return acc
    }, {})

    return { total, byMethod, byService }
}

'use server'

import { createClient } from '@/lib/supabase/server'

export interface ClinicSubscription {
    status: 'active' | 'inactive'
    plan: 'free' | 'pro'
    currentPeriodEnd: string | null
    stripeCustomerId: string | null
}

export async function getClinicSubscription(): Promise<ClinicSubscription> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { status: 'inactive', plan: 'free', currentPeriodEnd: null, stripeCustomerId: null }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id, clinics(subscription_status, subscription_plan, subscription_current_period_end, stripe_customer_id)')
        .eq('id', user.id)
        .single()

    const clinic = profile?.clinics as any

    if (!clinic) {
        return { status: 'inactive', plan: 'free', currentPeriodEnd: null, stripeCustomerId: null }
    }

    return {
        status: clinic.subscription_status === 'active' ? 'active' : 'inactive',
        plan: clinic.subscription_plan === 'pro' ? 'pro' : 'free',
        currentPeriodEnd: clinic.subscription_current_period_end ?? null,
        stripeCustomerId: clinic.stripe_customer_id ?? null,
    }
}

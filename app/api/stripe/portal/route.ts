import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('clinic_id, clinics(stripe_customer_id)')
            .eq('id', user.id)
            .single()

        const clinicData = profile?.clinics as any

        if (!clinicData?.stripe_customer_id) {
            return new NextResponse('No active subscription found', { status: 404 })
        }

        const headersList = await headers()
        const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL

        const session = await stripe.billingPortal.sessions.create({
            customer: clinicData.stripe_customer_id,
            return_url: `${origin}/dashboard/settings/billing`,
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error('[portal]', err)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

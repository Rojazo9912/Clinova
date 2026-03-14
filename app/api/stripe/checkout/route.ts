import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('clinic_id, clinics(id, name, stripe_customer_id, stripe_subscription_id, subscription_status)')
            .eq('id', user.id)
            .single()

        const clinicData = profile?.clinics as any

        if (!clinicData) {
            return new NextResponse('Clinic not found', { status: 404 })
        }

        const headersList = await headers()
        const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL

        // Already active → redirect to customer portal instead of new checkout
        if (clinicData.subscription_status === 'active' && clinicData.stripe_customer_id) {
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: clinicData.stripe_customer_id,
                return_url: `${origin}/dashboard/settings/billing`,
            })
            return NextResponse.json({ url: portalSession.url })
        }

        const body = await req.json().catch(() => ({}))
        const { billingCycle = 'monthly' } = body

        let priceId = process.env.STRIPE_PRICE_MONTHLY
        
        if (billingCycle === 'annual') {
            priceId = process.env.STRIPE_PRICE_ANNUAL
        } else if (billingCycle === 'quarterly') {
            priceId = process.env.STRIPE_PRICE_QUARTERLY
        }

        if (!priceId) {
            console.error(`Stripe price not configured for cycle: ${billingCycle}`)
            return new NextResponse('Stripe price not configured', { status: 500 })
        }

        const session = await stripe.checkout.sessions.create({
            customer: clinicData.stripe_customer_id || undefined,
            customer_email: clinicData.stripe_customer_id ? undefined : user.email,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${origin}/dashboard/settings/billing?success=true`,
            cancel_url: `${origin}/dashboard/settings/billing?canceled=true`,
            metadata: { clinicId: clinicData.id, userId: user.id },
            client_reference_id: clinicData.id,
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error('[checkout]', err)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

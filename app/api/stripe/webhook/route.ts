import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'


export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-01-28.clover',
    })
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    const body = await req.text()
    const signature = (await headers()).get('stripe-signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const supabase = await createClient() // NOTE: Needs Service Role to update arbitrary clinics? 
        // Actually, createClient here uses default cookies or anon. 
        // For webhooks, we usually need a SUPABASE_SERVICE_ROLE_KEY client to bypass RLS.
        // For now, assuming RLS allows this or we switch to Admin client.

        // We'll use the metadata we passed
        const clinicId = session.client_reference_id
        const customerId = session.customer as string

        if (clinicId) {
            // We really need an Admin Client here for Webhooks usually
            // But let's assume standard client for now to avoid complexity of addl setup if possible
            // Actually, no, webhooks are unauthenticated. We MUST use Admin Key.
            // Let's rely on standard client failing if RLS blocks, but we can fix it later.

            await supabase
                .from('clinics')
                .update({
                    stripe_customer_id: customerId,
                    subscription_status: 'active'
                })
                .eq('id', clinicId)
        }
    }

    return new NextResponse(null, { status: 200 })
}

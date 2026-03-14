import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error: any) {
        console.error('[webhook] Signature error:', error.message)
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    // Use Admin client to bypass RLS — webhooks have no user session
    const supabase = createAdminClient()

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const clinicId = session.client_reference_id
                const customerId = session.customer as string
                const subscriptionId = session.subscription as string

                if (!clinicId) break

                // Fetch subscription to get period_end
                const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any

                await supabase
                    .from('clinics')
                    .update({
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        subscription_status: 'active',
                        subscription_plan: 'pro',
                        subscription_current_period_end: subscription.current_period_end
                            ? new Date(subscription.current_period_end * 1000).toISOString()
                            : null,
                    })
                    .eq('id', clinicId)

                console.log('[webhook] checkout.session.completed → clinic', clinicId)
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any
                const customerId = subscription.customer as string
                const isActive = subscription.status === 'active'

                await supabase
                    .from('clinics')
                    .update({
                        subscription_status: isActive ? 'active' : 'inactive',
                        subscription_current_period_end: subscription.current_period_end
                            ? new Date(subscription.current_period_end * 1000).toISOString()
                            : null,
                    })
                    .eq('stripe_customer_id', customerId)

                console.log('[webhook] customer.subscription.updated → customer', customerId, '→', subscription.status)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any
                const customerId = subscription.customer as string

                await supabase
                    .from('clinics')
                    .update({
                        subscription_status: 'inactive',
                        subscription_plan: 'free',
                        stripe_subscription_id: null,
                        subscription_current_period_end: null,
                    })
                    .eq('stripe_customer_id', customerId)

                console.log('[webhook] customer.subscription.deleted → customer', customerId)
                break
            }

            default:
                console.log('[webhook] Unhandled event type:', event.type)
        }
    } catch (err: any) {
        console.error('[webhook] Handler error:', err)
        return new NextResponse('Handler error', { status: 500 })
    }

    return new NextResponse(null, { status: 200 })
}

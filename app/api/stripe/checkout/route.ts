import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'


export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-01-28.clover',
    })

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { data: clinic } = await supabase
            .from('profiles')
            .select('clinics(*)')
            .eq('id', user.id)
            .single()

        // @ts-ignore
        const clinicData = clinic?.clinics as any

        if (!clinicData) {
            return new NextResponse('Clinic not found', { status: 404 })
        }

        const headersList = await headers()
        const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL

        const session = await stripe.checkout.sessions.create({
            customer: clinicData.stripe_customer_id || undefined, // If existing customer
            line_items: [
                {
                    price: 'price_1QjXXXX', // Replace with dynamic price ID from request body or hardcode for MVP
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/dashboard/settings/billing?success=true`,
            cancel_url: `${origin}/dashboard/settings/billing?canceled=true`,
            metadata: {
                clinicId: clinicData.id,
                userId: user.id
            },
            client_reference_id: clinicData.id,
            customer_email: user.email,
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error(err)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

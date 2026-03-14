import Stripe from 'stripe'

// Singleton Stripe client — reused across API routes
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2026-01-28.clover',
})

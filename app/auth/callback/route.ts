import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/'

    const getBaseUrl = () => {
        const forwardedHost = request.headers.get('x-forwarded-host')
        if (process.env.NODE_ENV === 'development') return origin
        if (forwardedHost) return `https://${forwardedHost}`
        return (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/+$/, '')
    }

    const baseUrl = getBaseUrl()
    const supabase = await createClient()

    // Handle PKCE flow (code exchange)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${baseUrl}${next}`)
        }
        console.error('Auth callback - code exchange error:', error.message)
    }

    // Handle token hash flow (email invites, magic links)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as 'invite' | 'email' | 'signup' | 'magiclink' | 'recovery',
        })
        if (!error) {
            return NextResponse.redirect(`${baseUrl}${next}`)
        }
        console.error('Auth callback - token verification error:', error.message)
    }

    console.error('Auth callback - no code or token_hash found. Params:', Object.fromEntries(searchParams.entries()))

    // return the user to login with error message
    return NextResponse.redirect(`${baseUrl}/login?error=auth-code-error`)
}

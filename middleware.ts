import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // Update Supabase session
    const response = await updateSession(request)

    const url = request.nextUrl
    const hostname = request.headers.get("host") || ""

    // Define allowed domains (localhost, main domain)
    // TODO: Move this to env var or config
    const allowedDomains = ["localhost:3000", "clinova.com"]

    const isPublicRoute = allowedDomains.some(domain => hostname === domain) || hostname.endsWith(".vercel.app") // simplified for now

    // If it's a tenant subdomain (e.g. clinic.clinova.com)
    // We can rewrite to /app/[domain]/...
    // For now, let's just ensure basic auth session update which is done above.

    // Future logic:
    // if (!isPublicRoute) {
    //   const subdomain = hostname.split('.')[0]
    //   return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, request.url))
    // }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

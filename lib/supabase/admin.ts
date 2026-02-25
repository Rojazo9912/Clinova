import { createClient } from '@supabase/supabase-js'

// This client uses the service role key to bypass RLS.
// NEVER use this client on the frontend or expose it to the client side.
// It is strictly for server-side administrative tasks.
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            }
        }
    )
}

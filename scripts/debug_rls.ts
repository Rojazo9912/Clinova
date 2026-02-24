import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function inspectPolicies() {
    console.log('--- Inspecting Policies ---')
    // This requires SQL execution capability usually, or access to pg_policies if exposed.
    // Via supabase-js standard client we can't query pg_catalog directly easily unless exposed.
    // Instead, we will try to fetch profiles as the admin user (service role) to verify data integrity first.

    console.log('1. Service Role Fetch (Should Bypass RLS):')
    const { data: profiles, error } = await supabase.from('profiles').select('*').limit(5)
    if (error) console.error('Service Role Error:', error)
    else console.log('Service Role Success. Count:', profiles.length)

    // Check if we can execute the function
    console.log('2. RPC Call check:')
    const { data: role, error: rpcError } = await supabase.rpc('get_my_role')
    if (rpcError) console.log('RPC Error (Expected if no auth context):', rpcError.message)
    else console.log('RPC Success (Expected null/empty):', role)
}

inspectPolicies()

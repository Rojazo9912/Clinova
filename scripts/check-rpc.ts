import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyRpcs() {
    console.log('--- Verifying RPCs ---')

    // Test get_my_role
    // Note: Calling with service role might return null for auth.uid() inside logic, but should NOT error "function not found".
    const { data: roleData, error: roleError } = await supabase.rpc('get_my_role')
    if (roleError) console.log('❌ get_my_role check failed:', roleError.message)
    else console.log('✅ get_my_role exists (returned:', roleData, ')')

    // Test get_my_profile_data
    const { data: profileData, error: profileError } = await supabase.rpc('get_my_profile_data')
    if (profileError) console.log('❌ get_my_profile_data check failed:', profileError.message)
    else console.log('✅ get_my_profile_data exists (returned:', profileData, ')')
}

verifyRpcs()

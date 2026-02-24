import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyProfile() {
    const targetId = '2838b91d-152d-4776-b0e2-d8ce1d323f52'

    console.log(`Checking profile: ${targetId}`)

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single()

    if (error) {
        console.error('Error fetching profile (Service Role):', error)
    } else {
        console.log('✅ Profile Found (Service Role):', profile)
    }

    // Check Auth user
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(targetId)

    if (authError) {
        console.error('Error fetching Auth User:', authError)
    } else {
        console.log('✅ Auth User Found:', user?.email)
    }
}

verifyProfile()

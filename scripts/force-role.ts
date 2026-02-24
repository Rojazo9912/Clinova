import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function forceCheck() {
    const targetId = '2838b91d-152d-4776-b0e2-d8ce1d323f52'
    console.log(`Checking ID: ${targetId}`)

    // 1. SELECT
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', targetId)
        .maybeSingle()

    if (error) console.error('Fetch Error:', error)
    else console.log('Current Profile:', profile)

    // 2. FORCE UPDATE
    console.log('Force updating to super_admin...')
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'super_admin' })
        .eq('id', targetId)

    if (updateError) console.error('Update Error:', updateError)
    else console.log('Update Success')

    // 3. VERIFY
    const { data: verify } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', targetId)
        .maybeSingle()
    console.log('New Role:', verify?.role)
}

forceCheck()

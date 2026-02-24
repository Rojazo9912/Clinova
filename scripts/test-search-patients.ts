
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testSearch() {
    console.log('1. Checking if patient_users exists in public schema...')
    // Note: This query might fail if service role can't access information_schema, but worth a shot
    const { data: tableExists, error: tableError } = await supabase
        .rpc('get_schema_info', { table_name: 'patient_users' })
    // fallback to direct select if rpc doesn't exist

    console.log('2. Direct select from patient_users...')
    const { data: users, error: usersError } = await supabase
        .from('patient_users')
        .select('*')
        .limit(1)

    if (usersError) {
        console.error('Error selecting from patient_users:', usersError)
    } else {
        console.log('patient_users data sample:', users)
    }

    console.log('3. Testing join again...')
    const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, patient_users(is_active)')
        .limit(1)

    if (error) {
        console.error('Join Error:', error)
    } else {
        console.log('Join Success:', JSON.stringify(data, null, 2))
    }
}

testSearch()

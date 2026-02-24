import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
    console.log('--- Database Status ---')

    const { count: clinicCount, error: clinicError } = await supabase
        .from('clinics')
        .select('*', { count: 'exact', head: true })

    if (clinicError) console.error('Error fetching clinics:', clinicError.message)
    else console.log(`Clinics: ${clinicCount}`)

    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) console.error('Error fetching users:', userError.message)
    else console.log(`Auth Users: ${users.length}`)

    const { count: profileCount, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    if (profileError) console.error('Error fetching profiles:', profileError.message)
    else console.log(`Profiles: ${profileCount}`)
}

check()

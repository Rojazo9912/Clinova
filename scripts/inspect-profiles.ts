import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkProfiles() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')

    if (error) {
        console.error(error)
        return
    }

    console.log('--- Current Profiles ---')
    profiles.forEach(p => console.log(`ID: ${p.id}, Role: ${p.role}, Name: ${p.full_name}, Clinic: ${p.clinic_id}`))

    console.log('--- Auth Users (First 10) ---')
    const { data: { users } } = await supabase.auth.admin.listUsers()
    users.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}`))
}

checkProfiles()

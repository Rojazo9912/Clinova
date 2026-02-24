
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function inspectClinicUsers() {
    const clinicId = 'd9d69047-24a7-4eb7-bb7e-96856e5dc209' // ID from screenshot

    console.log(`Checking profiles for clinic: ${clinicId}`)

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clinic_id', clinicId)

    if (error) {
        console.error('Error fetching profiles:', error)
        return
    }

    console.log(`Found ${profiles.length} profiles:`)
    profiles.forEach(p => {
        console.log(`- ${p.full_name} (${p.role}) - ID: ${p.id}`)
    })

    // Also list all profiles just in case of mismatch
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    console.log(`Total profiles in DB: ${count}`)
}

inspectClinicUsers()

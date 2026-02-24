import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function deepCheck() {
    const email = 'admin@clinova.com'
    console.log(`Deep check for: ${email}`)

    // List ALL users
    const { data: { users } } = await supabase.auth.admin.listUsers()

    // Filter matches
    const matches = users.filter(u => u.email === email)
    console.log(`Found ${matches.length} user(s) with this email.`)

    for (const u of matches) {
        console.log(`\nUser ID: ${u.id}`)
        console.log(`- Created: ${u.created_at}`)

        // Check profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle()

        if (profile) {
            console.log(`✅ Profile attached! Role: ${profile.role}`)
        } else {
            console.log(`❌ NO PROFILE FOUND for this ID.`)
        }
    }
}

deepCheck()

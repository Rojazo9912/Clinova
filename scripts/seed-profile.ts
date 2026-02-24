import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables correctly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing Supabase keys in .env.local')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
    const targetEmail = process.argv[2]

    if (!targetEmail) {
        console.log('\nUsage: npx tsx scripts/seed-profile.ts <email>')
        console.log('--- Available Users ---')

        // List users to help identify the email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 10 })
        if (listError) console.error('Could not list users:', listError.message)
        else {
            users.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`))
        }
        process.exit(0)
    }

    console.log(`\n🔍 Looking for user: ${targetEmail}...`)

    // 1. Find User by Email (Client-side filter since listUsers doesn't filter by email directly in all versions)
    // Or simpler: just list and find.
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 100 })
    const user = users?.find(u => u.email === targetEmail)

    if (!user) {
        console.error(`❌ User not found via Auth Admin API. Check the email.`)
        process.exit(1)
    }
    console.log(`✅ User found: ${user.id}`)

    // 2. Find First Clinic
    const { data: clinics, error: clinicError } = await supabase
        .from('clinics')
        .select('id, name')
        .limit(1)

    if (clinicError || !clinics?.length) {
        console.error('❌ No clinics found in database. Create one first via SQL.')
        process.exit(1)
    }

    const clinic = clinics[0]
    console.log(`✅ Using Clinic: ${clinic.name} (${clinic.id})`)

    // 3. Upsert Profile
    console.log('📝 Creating/Updating Profile...')
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            clinic_id: clinic.id,
            role: 'clinic_manager',
            full_name: 'Admin User',
            updated_at: new Date().toISOString()
        })

    if (profileError) {
        console.error('❌ Failed to update profile:', profileError.message)
    } else {
        console.log('🎉 Success! User assigned to clinic. Refresh your dashboard.')
    }
}

main()

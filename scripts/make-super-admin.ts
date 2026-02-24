import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function makeSuperAdmin(email: string) {
    console.log(`Looking for user: ${email}`)

    // 1. Get User ID (Listing users because by email might not be exposed directly in admin api widely)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('List error:', listError)
        return
    }

    const user = users.find(u => u.email === email)

    if (!user) {
        console.error('User not found')
        return
    }

    console.log(`Found user ${user.id}. Updating profile...`)

    // 2. Update Profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'super_admin' })
        .eq('id', user.id)

    if (updateError) {
        console.error('Update failed:', updateError)
    } else {
        console.log(`✅ Success! ${email} is now a Super Admin.`)
    }
}

const email = process.argv[2]
if (!email) {
    console.log('Usage: npx tsx scripts/make-super-admin.ts <email>')
} else {
    makeSuperAdmin(email)
}

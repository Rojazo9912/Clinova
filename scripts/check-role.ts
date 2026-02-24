import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkAdminRole() {
    const email = 'admin@clinova.com'
    console.log(`Checking role for: ${email}`)

    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === email)

    if (!user) {
        console.log('User not found')
        return
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Profile fetch error:', error)
    } else {
        console.log('Profile found:')
        console.log(`- ID: ${profile.id}`)
        console.log(`- Role: '${profile.role}'`) // Quotes to check for whitespace
        console.log(`- Is Super Admin? ${profile.role === 'super_admin'}`)
    }
}

checkAdminRole()

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testRpc() {
    const email = 'admin@clinova.com'
    console.log(`Testing RPC for: ${email}`)

    // 1. Get User ID
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === email)

    if (!user) {
        console.error('User not found')
        return
    }

    console.log(`User ID: ${user.id}`)

    // 2. Call RPC via REST (Service Role can call it, but we want to simulate user context if possible, 
    // but without password we can't login as user. 
    // However, we can use .rpc() with the Service Role to at least see if the FUNCTION exists and works mechanically.
    // The function relies on 'auth.uid()', so calling it with Service Role might return null or error because auth.uid() is null.
    // BUT we can use 'postgres' trick or similar? No.

    // Instead, let's just inspect the profile directly again to ensure the row says 'super_admin'.
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    console.log(`Direct Profile Role: ${profile?.role}`)

    // 3. We can't easily test 'auth.uid()' logic from here without logging in.
    // But we can verifying the logic.
}

testRpc()

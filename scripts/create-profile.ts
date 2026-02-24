import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createProfile() {
    const userId = '2838b91d-152d-4776-b0e2-d8ce1d323f52'

    console.log(`Creating profile for: ${userId}`)

    const { data, error } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            role: 'super_admin',
            full_name: 'Super Admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
            // clinic_id is nullable for super_admin
        })
        .select()
        .single()

    if (error) {
        console.error('Insert Error:', error)
    } else {
        console.log('✅ Profile Created:', data)
    }
}

createProfile()

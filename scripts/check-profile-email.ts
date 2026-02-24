
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function checkSchema() {
    console.log('Checking profiles table schema...')

    // Try to select email from profiles
    const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .limit(1)

    if (error) {
        console.log('Error selecting email:', error.message)
        if (error.message.includes('does not exist')) {
            console.log('CONCLUSION: Column "email" DOES NOT EXIST.')
        } else {
            console.log('CONCLUSION: Unknown error.')
        }
    } else {
        console.log('Success! Selected email column.')
        console.log('CONCLUSION: Column "email" EXISTS.')
    }
}

checkSchema()

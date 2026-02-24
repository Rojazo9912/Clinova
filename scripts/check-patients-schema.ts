
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkPatientsSchema() {
    console.log('Checking patients table...')
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error selecting from patients:', error)
    } else {
        console.log('Patients columns:', data && data.length > 0 ? Object.keys(data[0]) : 'Table empty or no access')
    }

    console.log('Checking patient_users table...')
    const { data: usersData, error: usersError } = await supabase
        .from('patient_users')
        .select('*')
        .limit(1)

    if (usersError) {
        console.error('Error selecting from patient_users:', usersError)
    } else {
        console.log('Patient Users columns:', usersData && usersData.length > 0 ? Object.keys(usersData[0]) : 'Table empty or no access')
    }
}

checkPatientsSchema()

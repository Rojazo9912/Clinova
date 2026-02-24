import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
    console.log('--- PERFILES (solo ID y clinic_id) ---')
    const { data, error } = await supabase
        .from('profiles')
        .select('id, clinic_id')
        .limit(5)

    if (error) {
        console.error('Error:', error.message)
        return
    }

    console.table(data)

    console.log('\n--- PACIENTE 3fffb76e-4c2b-4f33-a11c-f5391ea6fd60 ---')
    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id, first_name, last_name, clinic_id')
        .eq('id', '3fffb76e-4c2b-4f33-a11c-f5391ea6fd60')
        .single()

    if (patientError) {
        console.error('Error:', patientError.message)
        return
    }

    console.log('Paciente:', patient)
    console.log('\n¿Hay algún perfil con clinic_id =', patient.clinic_id, '?')

    const { data: matchingProfiles } = await supabase
        .from('profiles')
        .select('id, clinic_id')
        .eq('clinic_id', patient.clinic_id)

    console.table(matchingProfiles)
}

main()

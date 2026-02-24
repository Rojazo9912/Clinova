
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const PATIENT_ID = '3fffb76e-4c2b-4f33-a11c-f5391ea6fd60'

async function main() {
    console.log(`🔍 Buscando paciente: ${PATIENT_ID}`)

    const { data: patient, error } = await supabase
        .from('patients')
        .select(`
            *,
            clinics (id, name)
        `)
        .eq('id', PATIENT_ID)
        .single()

    if (error) {
        console.error('❌ Error buscando paciente:', error)
        return
    }

    if (!patient) {
        console.error('❌ Paciente NO encontrado en la base de datos.')
        return
    }

    console.log('✅ Paciente Encontrado:')
    console.log(`   ID: ${patient.id}`)
    console.log(`   Nombre: ${patient.first_name} ${patient.last_name}`)
    console.log(`   Clinic ID: ${patient.clinic_id}`)
    console.log(`   Clinic Name: ${patient.clinics?.name}`)
}

main()

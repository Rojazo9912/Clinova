
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

async function main() {
    console.log('🔍 Buscando una cita futura para generar link de prueba...')

    // Get the first upcoming appointment
    const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
            id,
            start_time,
            confirmation_token,
            patients (first_name, last_name),
            clinics (name)
        `)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .single()

    if (error || !appointment) {
        console.error('❌ No se encontraron citas futuras para probar.')
        console.log('   -> Crea una cita en la agenda y vuelve a ejecutar este script.')
        return
    }

    // Ensure it has a token (migration should have added it, but just in case)
    if (!appointment.confirmation_token) {
        console.log('⚠️ La cita no tiene token, generando uno...')
        const { data: updated, error: updateError } = await supabase
            .from('appointments')
            .update({ confirmation_token: crypto.randomUUID() }) // Use crypto if available or fetch new uuid
            .eq('id', appointment.id)
            .select()
            .single()

        if (updateError) {
            console.error('❌ Error generando token:', updateError)
            return
        }
        appointment.confirmation_token = updated.confirmation_token
    }

    const link = `http://localhost:3000/citas/confirmar/${appointment.confirmation_token}`
    const prodLink = `https://clinova-v2.up.railway.app/citas/confirmar/${appointment.confirmation_token}`

    const patient = Array.isArray(appointment.patients) ? appointment.patients[0] : appointment.patients
    const clinic = Array.isArray(appointment.clinics) ? appointment.clinics[0] : appointment.clinics

    console.log('\n✅ Cita Encontrada:')
    console.log(`   Paciente: ${patient?.first_name} ${patient?.last_name}`)
    console.log(`   Fecha: ${new Date(appointment.start_time).toLocaleString()}`)
    console.log(`   Clínica: ${clinic?.name}`)

    console.log('\n🔗 LINK DE PRUEBA (Local):')
    console.log(`   ${link}`)

    console.log('\n🔗 LINK DE PRUEBA (Producción):')
    console.log(`   ${prodLink}`)

    console.log('\n📋 INSTRUCCIONES:')
    console.log('1. Copia y abre el link en tu navegador.')
    console.log('2. Deberías ver la pantalla de "¡Cita Confirmada!".')
    console.log('3. La cita se marcará como confirmada en la base de datos.')
}

main()

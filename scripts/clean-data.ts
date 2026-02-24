import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function cleanData() {
    console.log('🧹 Iniciando limpieza de datos...\n')

    // 1. Limpiar sesiones de terapia (dependen de pacientes y fisios)
    console.log('📋 Eliminando sesiones de terapia...')
    const { error: sessionsError, count: sessionsCount } = await supabase
        .from('therapy_sessions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
        .select('id', { count: 'exact', head: true })

    if (sessionsError) {
        console.error('❌ Error al eliminar sesiones:', sessionsError)
    } else {
        console.log(`✅ Sesiones eliminadas: ${sessionsCount || 0}`)
    }

    // 2. Limpiar registros médicos (dependen de pacientes)
    console.log('\n📋 Eliminando registros médicos...')
    const { error: recordsError, count: recordsCount } = await supabase
        .from('medical_records')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select('id', { count: 'exact', head: true })

    if (recordsError) {
        console.error('❌ Error al eliminar registros médicos:', recordsError)
    } else {
        console.log(`✅ Registros médicos eliminados: ${recordsCount || 0}`)
    }

    // 3. Limpiar citas (dependen de pacientes)
    console.log('\n📅 Eliminando citas...')
    const { error: appointmentsError, count: appointmentsCount } = await supabase
        .from('appointments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select('id', { count: 'exact', head: true })

    if (appointmentsError) {
        console.error('❌ Error al eliminar citas:', appointmentsError)
    } else {
        console.log(`✅ Citas eliminadas: ${appointmentsCount || 0}`)
    }

    // 4. Limpiar pagos (dependen de pacientes)
    console.log('\n💰 Eliminando pagos...')
    const { error: paymentsError, count: paymentsCount } = await supabase
        .from('payments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select('id', { count: 'exact', head: true })

    if (paymentsError) {
        console.error('❌ Error al eliminar pagos:', paymentsError)
    } else {
        console.log(`✅ Pagos eliminados: ${paymentsCount || 0}`)
    }

    // 5. Limpiar pacientes
    console.log('\n👥 Eliminando pacientes...')
    const { error: patientsError, count: patientsCount } = await supabase
        .from('patients')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select('id', { count: 'exact', head: true })

    if (patientsError) {
        console.error('❌ Error al eliminar pacientes:', patientsError)
    } else {
        console.log(`✅ Pacientes eliminados: ${patientsCount || 0}`)
    }

    // 6. Limpiar fisioterapeutas (profiles con role='physio')
    console.log('\n🧑‍⚕️ Eliminando fisioterapeutas...')
    const { error: physiosError, count: physiosCount } = await supabase
        .from('profiles')
        .delete()
        .eq('role', 'physio')
        .select('id', { count: 'exact', head: true })

    if (physiosError) {
        console.error('❌ Error al eliminar fisioterapeutas:', physiosError)
    } else {
        console.log(`✅ Fisioterapeutas eliminados: ${physiosCount || 0}`)
    }

    // 7. Limpiar usuarios staff
    console.log('\n👔 Eliminando usuarios staff...')
    const { error: staffError, count: staffCount } = await supabase
        .from('profiles')
        .delete()
        .eq('role', 'staff')
        .select('id', { count: 'exact', head: true })

    if (staffError) {
        console.error('❌ Error al eliminar staff:', staffError)
    } else {
        console.log(`✅ Staff eliminado: ${staffCount || 0}`)
    }

    // 8. Limpiar clínicas
    console.log('\n🏥 Eliminando clínicas...')
    const { error: clinicsError, count: clinicsCount } = await supabase
        .from('clinics')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select('id', { count: 'exact', head: true })

    if (clinicsError) {
        console.error('❌ Error al eliminar clínicas:', clinicsError)
    } else {
        console.log(`✅ Clínicas eliminadas: ${clinicsCount || 0}`)
    }

    console.log('\n✨ Limpieza completada!')
    console.log('\n⚠️  NOTA: Los usuarios Super Admin y Clinic Manager NO fueron eliminados.')
    console.log('⚠️  ADVERTENCIA: Al eliminar clínicas, los usuarios quedarán sin clínica asignada.')
}

cleanData()

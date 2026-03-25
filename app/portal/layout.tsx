import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalLayoutWrapper from '@/components/portal/PortalLayoutWrapper'

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // If no user, allow access to login page only
    if (!user) {
        return <>{children}</>
    }

    // Verify user is a patient
    const { data: patientUser } = await supabase
        .from('patient_users')
        .select('patient_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

    // If not a patient, redirect to main site (unless it's an auth page)
    if (!patientUser) {
        // Here we could check the path too, but redirecting to / is safe for non-patients
        redirect('/')
    }

    // Fetch patient name for the shell
    const { data: patient } = await supabase
        .from('patients')
        .select('first_name, last_name')
        .eq('auth_user_id', user.id)
        .single()
    
    const patientName = patient ? `${patient.first_name}` : undefined

    return (
        <PortalLayoutWrapper patientName={patientName}>
            {children}
        </PortalLayoutWrapper>
    )
}

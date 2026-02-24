import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

    // If not a patient, redirect to main site
    if (!patientUser) {
        redirect('/')
    }

    return <>{children}</>
}

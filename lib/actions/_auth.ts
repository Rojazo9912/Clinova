'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Returns the authenticated user, their profile, and clinic_id in a single call.
 * Throws if the user is not authenticated or has no clinic assigned.
 * Use this at the top of every server action to eliminate the repeated boilerplate.
 */
export async function getAuthContext() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('No autenticado')

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('clinic_id, role')
        .eq('id', user.id)
        .single()

    if (profileError || !profile?.clinic_id) throw new Error('Sin clínica asignada')

    return { supabase, user, profile, clinicId: profile.clinic_id as string }
}

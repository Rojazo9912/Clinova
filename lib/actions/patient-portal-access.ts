'use server'

import { createClient } from '@/lib/supabase/server'
import { sendPatientWelcomeEmail } from '@/lib/emails/patient-welcome'

// Generate random password
function generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
}

export async function grantPortalAccess(patientId: string) {
    const supabase = await createClient()

    try {
        // 1. Get current user (who is granting access)
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
            throw new Error('Not authenticated')
        }

        // 2. Get patient data
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('id, first_name, last_name, email, clinic_id')
            .eq('id', patientId)
            .single()

        if (patientError || !patient) {
            throw new Error('Patient not found')
        }

        if (!patient.email) {
            throw new Error('Patient must have an email address')
        }

        // 3. Check if patient already has portal access
        const { data: existingAccess } = await supabase
            .from('patient_users')
            .select('id')
            .eq('patient_id', patientId)
            .single()

        if (existingAccess) {
            throw new Error('Patient already has portal access')
        }

        // 4. Get clinic name for email
        const { data: clinic } = await supabase
            .from('clinics')
            .select('name')
            .eq('id', patient.clinic_id)
            .single()

        // 5. Create user in Supabase Auth
        const tempPassword = generateRandomPassword()

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: patient.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                role: 'patient',
                patient_id: patientId,
                first_name: patient.first_name,
                last_name: patient.last_name
            }
        })

        if (authError || !authUser.user) {
            console.error('Error creating auth user:', authError)
            throw new Error('Failed to create user account')
        }

        // 6. Create patient_users record
        const { error: linkError } = await supabase
            .from('patient_users')
            .insert({
                user_id: authUser.user.id,
                patient_id: patientId,
                granted_by: currentUser.id,
                is_active: true
            })

        if (linkError) {
            console.error('Error linking patient user:', linkError)
            // Rollback: delete auth user
            await supabase.auth.admin.deleteUser(authUser.user.id)
            throw new Error('Failed to link patient account')
        }

        // 7. Send welcome email with credentials
        await sendPatientWelcomeEmail({
            to: patient.email,
            patientName: `${patient.first_name} ${patient.last_name}`,
            clinicName: clinic?.name || 'Clinova',
            email: patient.email,
            tempPassword: tempPassword,
            portalUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/portal`
        })

        return {
            success: true,
            message: 'Portal access granted successfully. Welcome email sent.'
        }

    } catch (error: any) {
        console.error('Error granting portal access:', error)
        return {
            success: false,
            message: error.message || 'Failed to grant portal access'
        }
    }
}

export async function revokePortalAccess(patientId: string) {
    const supabase = await createClient()

    try {
        // Get patient_users record
        const { data: patientUser } = await supabase
            .from('patient_users')
            .select('user_id')
            .eq('patient_id', patientId)
            .single()

        if (!patientUser) {
            throw new Error('Patient does not have portal access')
        }

        // Deactivate access
        const { error } = await supabase
            .from('patient_users')
            .update({ is_active: false })
            .eq('patient_id', patientId)

        if (error) {
            throw new Error('Failed to revoke access')
        }

        // Optionally: delete auth user
        // await supabase.auth.admin.deleteUser(patientUser.user_id)

        return {
            success: true,
            message: 'Portal access revoked successfully'
        }

    } catch (error: any) {
        console.error('Error revoking portal access:', error)
        return {
            success: false,
            message: error.message || 'Failed to revoke portal access'
        }
    }
}

export async function checkPatientHasAccess(patientId: string) {
    const supabase = await createClient()

    const { data } = await supabase
        .from('patient_users')
        .select('id, is_active, granted_at, first_login_at')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .limit(1)

    const accessData = data && data.length > 0 ? data[0] : null

    return {
        hasAccess: !!accessData,
        grantedAt: accessData?.granted_at,
        hasLoggedIn: !!accessData?.first_login_at
    }
}

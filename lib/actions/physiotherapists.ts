'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { sendPhysioWelcomeEmail } from '@/lib/emails/physio-welcome'

export async function getPhysiotherapists() {
    const supabase = await createClient()

    // Get current user's clinic
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, specialties, license_number, bio, avatar_url, created_at')
        .eq('clinic_id', profile.clinic_id)
        .eq('role', 'physio')
        .order('full_name')

    if (error) {
        console.error('Error fetching physiotherapists:', error)
        return []
    }

    return data || []
}

export async function createPhysiotherapist(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const licenseNumber = formData.get('license_number') as string
    const bio = formData.get('bio') as string
    const specialtiesStr = formData.get('specialties') as string
    const specialties = specialtiesStr ? specialtiesStr.split(',').map(s => s.trim()) : []

    // Get current user's clinic
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('Sin clínica asignada')

    // Initialize Admin Client for User Creation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://fisionova-production.up.railway.app'

    if (!serviceRoleKey) {
        throw new Error('Error de configuración: SUPABASE_SERVICE_ROLE_KEY faltante')
    }

    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createServiceClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Generate secure random password
    const tempPassword = crypto.randomBytes(6).toString('base64url')

    // Create user directly with password (no invite link needed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
            full_name: fullName,
            role: 'physio',
            clinic_id: profile.clinic_id
        }
    })

    if (authError) {
        throw new Error('Error al crear usuario: ' + authError.message)
    }

    if (!authData.user) {
        throw new Error('No se pudo crear el usuario')
    }

    // Create/Update Profile
    const { data: newProfile, error } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: authData.user.id,
            full_name: fullName,
            email,
            phone,
            role: 'physio',
            clinic_id: profile.clinic_id,
            license_number: licenseNumber,
            bio,
            specialties
        })
        .select()
        .single()

    if (error) {
        // Clean up auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        console.error('Error creating profile:', error)
        throw new Error('Error al crear perfil: ' + error.message)
    }

    // Get clinic name for the email
    const { data: clinic } = await supabaseAdmin
        .from('clinics')
        .select('name')
        .eq('id', profile.clinic_id)
        .single()

    // Send credentials via email
    const loginUrl = origin.replace(/\/+$/, '') + '/login'
    try {
        await sendPhysioWelcomeEmail({
            to: email,
            physioName: fullName,
            clinicName: clinic?.name || 'Tu Clínica',
            email,
            tempPassword,
            loginUrl
        })
    } catch (emailError) {
        console.error('Error sending welcome email:', emailError)
        // Don't fail the whole operation if email fails
    }

    revalidatePath('/dashboard/physiotherapists')
    return newProfile
}

export async function updatePhysiotherapist(id: string, formData: FormData) {
    const supabase = await createClient()

    const fullName = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const licenseNumber = formData.get('license_number') as string
    const bio = formData.get('bio') as string
    const specialtiesStr = formData.get('specialties') as string
    const specialties = specialtiesStr ? specialtiesStr.split(',').map(s => s.trim()) : []

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            email, // Allow updating email in profile (does not affect auth)
            phone,
            license_number: licenseNumber,
            bio,
            specialties
        })
        .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/physiotherapists')
}

export async function deletePhysiotherapist(id: string) {
    const supabase = await createClient()

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createServiceClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    // Delete profile first
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', id)

    if (profileError) throw new Error('Error al eliminar perfil: ' + profileError.message)

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (authError) throw new Error('Error al eliminar usuario: ' + authError.message)

    revalidatePath('/dashboard/physiotherapists')
}

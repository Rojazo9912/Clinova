'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function getUsers() {
    const supabase = await createClient()

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
        .select('id, full_name, email, phone, role, created_at')
        .eq('clinic_id', profile.clinic_id)

        .order('full_name')

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return data || []
}

export async function createUser(formData: FormData) {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('Sin clínica asignada')

    // Generar contraseña segura (12 caracteres)
    const securePassword = crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) + 'A1!'

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: securePassword,
        email_confirm: true,
        user_metadata: {
            full_name: fullName
        }
    })

    if (authError) {
        console.error('Error creando en Auth:', authError)
        throw new Error(`Error en Auth: ${authError.message}`)
    }

    if (!authData.user) throw new Error('No se devolvió ID de usuario desde Auth')

    // Insertar el perfil conectado al ID del usuario de Auth recién creado
    const { data: newProfile, error } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: authData.user.id,
            full_name: fullName,
            email,
            phone,
            role,
            clinic_id: profile.clinic_id
        })
        .select()
        .single()

    if (error) {
        // Rollback opcional, pero al menos lo registramos
        console.error('Error insertando perfil:', error)
        throw new Error(`Error en Profiles: ${error.message}`)
    }

    revalidatePath('/dashboard/users')
    return { profile: newProfile, password: securePassword }
}

export async function updateUser(id: string, formData: FormData) {
    const supabase = await createClient()

    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            phone,
            role
        })
        .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/users')
}

export async function deleteUser(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/users')
}

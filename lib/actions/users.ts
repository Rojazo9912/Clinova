'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { z } from 'zod'

const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    phone: z.string().max(20).optional(),
    role: z.string().min(1, 'El rol es requerido'),
})

const updateUserSchema = z.object({
    full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    phone: z.string().max(20).optional(),
    role: z.string().min(1, 'El rol es requerido'),
})

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
    const rawData = {
        email: formData.get('email'),
        full_name: formData.get('full_name'),
        phone: formData.get('phone') || undefined,
        role: formData.get('role'),
    }

    const validated = createUserSchema.safeParse(rawData)
    if (!validated.success) {
        throw new Error(validated.error.issues[0]?.message ?? 'Datos inválidos')
    }

    const { email, full_name, phone, role } = validated.data

    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('Sin clínica asignada')

    const securePassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) + 'A1!'

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: securePassword,
        email_confirm: true,
        user_metadata: { full_name }
    })

    if (authError) {
        throw new Error(`Error al crear usuario: ${authError.message}`)
    }

    if (!authData.user) throw new Error('No se pudo crear el usuario')

    const { data: newProfile, error } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: authData.user.id,
            full_name,
            email,
            phone: phone || null,
            role,
            clinic_id: profile.clinic_id
        })
        .select()
        .single()

    if (error) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        throw new Error(`Error al crear el perfil: ${error.message}`)
    }

    revalidatePath('/dashboard/users')
    return { profile: newProfile, password: securePassword }
}

export async function updateUser(id: string, formData: FormData) {
    if (!id || typeof id !== 'string') throw new Error('ID de usuario inválido')

    const rawData = {
        full_name: formData.get('full_name'),
        phone: formData.get('phone') || undefined,
        role: formData.get('role'),
    }

    const validated = updateUserSchema.safeParse(rawData)
    if (!validated.success) {
        throw new Error(validated.error.issues[0]?.message ?? 'Datos inválidos')
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: validated.data.full_name,
            phone: validated.data.phone || null,
            role: validated.data.role
        })
        .eq('id', id)

    if (error) throw new Error(`Error al actualizar usuario: ${error.message}`)

    revalidatePath('/dashboard/users')
}

export async function deleteUser(id: string) {
    if (!id || typeof id !== 'string') throw new Error('ID de usuario inválido')

    const supabase = await createClient()

    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

    if (error) throw new Error(`Error al eliminar usuario: ${error.message}`)

    revalidatePath('/dashboard/users')
}

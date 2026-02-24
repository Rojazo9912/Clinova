'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

    const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
            full_name: fullName,
            email,
            phone,
            role,
            clinic_id: profile.clinic_id
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/dashboard/users')
    return newProfile
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

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getRoles() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching roles:', error)
        return []
    }

    return data
}

export async function createRole(formData: FormData) {
    const supabase = await createClient()

    // Check permissions (Super Admin only)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    // Double check DB role for security (RLS handles this but good for early feedback)
    const { data: currentUserProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (currentUserProfile?.role !== 'super_admin') {
        throw new Error('No autorizado')
    }

    const name = formData.get('name') as string
    const code = formData.get('code') as string
    const permissions = JSON.parse(formData.get('permissions') as string)

    const { data, error } = await supabase
        .from('roles')
        .insert({
            code,
            name,
            permissions
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/dashboard/admin/roles')
    return data
}

export async function updateRole(code: string, formData: FormData) {
    const supabase = await createClient()

    // Check permissions (Super Admin only)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: currentUserProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (currentUserProfile?.role !== 'super_admin') {
        throw new Error('No autorizado')
    }

    const name = formData.get('name') as string
    const permissions = JSON.parse(formData.get('permissions') as string)

    const { error } = await supabase
        .from('roles')
        .update({
            name,
            permissions,
            updated_at: new Date().toISOString()
        })
        .eq('code', code)

    if (error) throw error

    revalidatePath('/dashboard/admin/roles')
}

export async function deleteRole(code: string) {
    const supabase = await createClient()

    // Check permissions (Super Admin only)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: currentUserProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (currentUserProfile?.role !== 'super_admin') {
        throw new Error('No autorizado')
    }

    const { error } = await supabase
        .from('roles')
        .delete()
        .eq('code', code)

    if (error) throw error

    revalidatePath('/dashboard/admin/roles')
}

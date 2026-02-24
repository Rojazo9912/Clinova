'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const clinicSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
})

export type Clinic = {
    id: string
    name: string
    slug: string
    address?: string
    phone?: string
    email?: string
    created_at: string
}

export async function getClinics() {
    const supabase = await createClient()

    // Verify Super Admin (Double check on server action for safety)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autenticado' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        return { error: 'No autorizado: Requiere rol super_admin' }
    }

    const { data: clinics, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return { error: error.message }
    }

    return clinics as Clinic[]
}

export async function createClinic(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Verify Super Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return {
            message: 'No autenticado',
        }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        return {
            message: 'No autorizado: Requiere rol super_admin',
        }
    }

    // Validate Input
    const rawData = {
        name: formData.get('name'),
        slug: formData.get('slug'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
    }

    const validatedFields = clinicSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
        }
    }

    // Insert Database
    const { error } = await supabase
        .from('clinics')
        .insert({
            name: validatedFields.data.name,
            slug: validatedFields.data.slug,
            address: validatedFields.data.address,
            phone: validatedFields.data.phone,
            email: validatedFields.data.email || null,
        })

    if (error) {
        return {
            message: 'Error al crear la clínica: ' + error.message,
        }
    }

    revalidatePath('/dashboard/admin')
    redirect('/dashboard/admin')
}

export async function getClinicById(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (profile?.role !== 'super_admin') {
        return { error: 'No autorizado' }
    }

    const { data: clinic, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return { error: error.message }
    return clinic as Clinic
}

export async function getClinicUsers(clinicId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Verify admin
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (adminProfile?.role !== 'super_admin') return []

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, created_at')
        .eq('clinic_id', clinicId)
        .order('full_name')

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return data
}

export async function createClinicUser(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Verify Super Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { message: 'No autenticado' }

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (adminProfile?.role !== 'super_admin') {
        return { message: 'No autorizado' }
    }

    // 2. Extract Data
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const clinicId = formData.get('clinic_id') as string
    const role = formData.get('role') as string || 'clinic_manager'

    console.log('--- createClinicUser Debug ---')
    console.log('Received formData:', Object.fromEntries(formData))
    console.log('clinicId:', clinicId)
    console.log('------------------------------')



    if (!email || !password || !fullName || !clinicId) {
        return { message: 'Faltan campos requeridos' }
    }

    // 3. Admin Client Setup
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!serviceRoleKey) {
        return { message: 'Error de configuración: SUPABASE_SERVICE_ROLE_KEY faltante' }
    }

    // Import supabase-js dynamically to avoid issues if not installed (though it should be)
    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createServiceClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // 4. Create User
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
    })

    if (authError) {
        return { message: 'Error al crear usuario auth: ' + authError.message }
    }

    if (!newUser.user) {
        return { message: 'Wtf? No se pudo crear el usuario' }
    }

    // 5. Update/Create Profile
    // Try update first assuming trigger ran
    const { data: updatedUsers, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
            full_name: fullName,
            phone: phone || null,
            role: role as any,
            clinic_id: clinicId
        })
        .eq('id', newUser.user.id)
        .select('id')

    // Fallback Insert if profile doesn't exist (trigger fail or count is 0)
    if (updateError || !updatedUsers || updatedUsers.length === 0) {
        console.log('Profile update failed or no rows matched. Attempting insert.')

        // Try insert
        const { error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: newUser.user.id,
                full_name: fullName,
                // email deleted
                phone: phone || null,
                role: role as any,
                clinic_id: clinicId
            })

        if (insertError) {
            // Rollback auth
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
            return { message: 'Usuario creado pero falló perfil: ' + insertError.message }
        }
    }


    revalidatePath(`/dashboard/admin/clinics/${clinicId}`)
    return { message: 'Usuario creado exitosamente', success: true }
}

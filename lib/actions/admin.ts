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

const clinicUserSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    phone: z.string().optional(),
    clinic_id: z.string().uuid('ID de clínica inválido'),
    role: z.string().min(1, 'El rol es requerido'),
})

export type Clinic = {
    id: string
    name: string
    slug: string
    address?: string | null
    phone?: string | null
    email?: string | null
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    subscription_status?: string | null
    subscription_plan?: string | null
    subscription_current_period_end?: string | null
    created_at: string
}

export async function getClinics() {
    const supabase = await createClient()

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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { message: 'No autenticado' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        return { message: 'No autorizado: Requiere rol super_admin' }
    }

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
        return { message: 'Error al crear la clínica: ' + error.message }
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
        console.error('Error fetching clinic users:', error)
        return []
    }

    return data
}

export async function createClinicUser(prevState: any, formData: FormData) {
    const supabase = await createClient()

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

    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
        full_name: formData.get('full_name'),
        phone: formData.get('phone') || undefined,
        clinic_id: formData.get('clinic_id'),
        role: formData.get('role') || 'clinic_manager',
    }

    const validated = clinicUserSchema.safeParse(rawData)
    if (!validated.success) {
        const firstError = Object.values(validated.error.flatten().fieldErrors).flat()[0]
        return { message: firstError ?? 'Datos inválidos' }
    }

    const { email, password, full_name, phone, clinic_id, role } = validated.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!serviceRoleKey) {
        return { message: 'Error de configuración del servidor' }
    }

    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createServiceClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name }
    })

    if (authError) {
        return { message: 'Error al crear usuario: ' + authError.message }
    }

    if (!newUser.user) {
        return { message: 'No se pudo crear el usuario' }
    }

    const { data: updatedUsers, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
            full_name,
            phone: phone || null,
            role: role as any,
            clinic_id
        })
        .eq('id', newUser.user.id)
        .select('id')

    if (updateError || !updatedUsers || updatedUsers.length === 0) {
        const { error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: newUser.user.id,
                full_name,
                phone: phone || null,
                role: role as any,
                clinic_id
            })

        if (insertError) {
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
            return { message: 'Error al crear el perfil del usuario: ' + insertError.message }
        }
    }

    revalidatePath(`/dashboard/admin/clinics/${clinic_id}`)
    return { message: 'Usuario creado exitosamente', success: true }
}

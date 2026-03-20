'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const onboardingSchema = z.object({
    clinicName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    clinicSlug: z.string().min(3, 'El slug debe tener al menos 3 caracteres')
        .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones')
        .max(50),
})

export async function setupNewClinic(formData: FormData) {
    const rawData = {
        clinicName: formData.get('clinicName'),
        clinicSlug: formData.get('clinicSlug'),
    }

    const validated = onboardingSchema.safeParse(rawData)
    if (!validated.success) {
        throw new Error(validated.error.issues[0]?.message ?? 'Datos inválidos')
    }

    const { clinicName, clinicSlug } = validated.data

    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // 1. Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('No estás autenticado.')

    // 2. Check if slug exists
    const { data: existingClinic } = await supabase
        .from('clinics')
        .select('id')
        .eq('slug', clinicSlug)
        .single()

    if (existingClinic) {
        throw new Error('Este identificador (slug) ya está en uso. Por favor, elige otro.')
    }

    // 3. Create the clinic using Admin Client
    const { data: newClinic, error: clinicError } = await supabaseAdmin
        .from('clinics')
        .insert({
            name: clinicName,
            slug: clinicSlug,
            subscription_status: 'trial', // Default to trial or free depending on business logic
        })
        .select()
        .single()

    if (clinicError || !newClinic) {
        console.error('Error creating clinic:', clinicError)
        throw new Error(`Error al crear la clínica: ${clinicError?.message}`)
    }

    // 4. Create/Update the profile for the user using Admin Client
    // We use upsert in case the trigger fired or a partial row exists
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: user.id,
            clinic_id: newClinic.id,
            role: 'super_admin',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        })

    if (profileError) {
        console.error('Error creating profile:', profileError)
        // Rollback clinic creation just in case
        await supabaseAdmin.from('clinics').delete().eq('id', newClinic.id)
        throw new Error('Error al establecer tu perfil como administrador.')
    }

    revalidatePath('/dashboard')
    
    return { success: true, clinicId: newClinic.id }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AvailabilityBlock {
    id: string
    clinic_id: string
    therapist_id: string | null
    start_time: string
    end_time: string
    reason: string | null
    is_recurring: boolean
    recurrence_rule: any | null
    created_at: string
}

export interface CreateAvailabilityBlockData {
    start_time: Date
    end_time: Date
    reason?: string
    therapist_id?: string
    is_recurring?: boolean
    recurrence_rule?: {
        frequency: 'daily' | 'weekly' | 'monthly'
        interval: number
        daysOfWeek?: number[]
        endDate?: string
    }
}

/**
 * Create a new availability block
 */
export async function createAvailabilityBlock(data: CreateAvailabilityBlockData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('No clinic found')

    const { data: block, error } = await supabase
        .from('availability_blocks')
        .insert({
            clinic_id: profile.clinic_id,
            therapist_id: data.therapist_id || null,
            start_time: data.start_time.toISOString(),
            end_time: data.end_time.toISOString(),
            reason: data.reason || null,
            is_recurring: data.is_recurring || false,
            recurrence_rule: data.recurrence_rule || null,
            created_by: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating availability block:', error)
        throw new Error('Failed to create availability block')
    }

    revalidatePath('/dashboard/agenda')
    return block
}

/**
 * Get availability blocks for a date range
 */
export async function getAvailabilityBlocks(startDate: Date, endDate: Date) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const { data: blocks, error } = await supabase
        .from('availability_blocks')
        .select(`
            *,
            profiles!availability_blocks_therapist_id_fkey (
                full_name
            )
        `)
        .eq('clinic_id', profile.clinic_id)
        .gte('end_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time')

    if (error) {
        console.error('Error fetching availability blocks:', error)
        return []
    }

    return blocks || []
}

/**
 * Delete an availability block
 */
export async function deleteAvailabilityBlock(blockId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('availability_blocks')
        .delete()
        .eq('id', blockId)

    if (error) {
        console.error('Error deleting availability block:', error)
        throw new Error('Failed to delete availability block')
    }

    revalidatePath('/dashboard/agenda')
}

/**
 * Check if a time slot conflicts with any availability blocks
 */
export async function checkTimeSlotAvailability(
    startTime: Date,
    endTime: Date,
    therapistId?: string
): Promise<{ available: boolean; conflictingBlock?: AvailabilityBlock }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { available: false }

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return { available: false }

    let query = supabase
        .from('availability_blocks')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .lt('start_time', endTime.toISOString())
        .gt('end_time', startTime.toISOString())

    // Check both clinic-wide blocks and therapist-specific blocks
    if (therapistId) {
        query = query.or(`therapist_id.is.null,therapist_id.eq.${therapistId}`)
    } else {
        query = query.is('therapist_id', null)
    }

    const { data: blocks } = await query

    if (blocks && blocks.length > 0) {
        return {
            available: false,
            conflictingBlock: blocks[0]
        }
    }

    return { available: true }
}

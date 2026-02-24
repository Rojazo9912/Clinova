'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface RecurrenceRule {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    daysOfWeek?: number[] // 0=Sunday, 1=Monday, etc.
    endDate?: string
    occurrences?: number
}

export interface CreateRecurringAppointmentData {
    patient_id: string
    service_id: string
    start_time: Date
    duration_minutes: number
    recurrence_rule: RecurrenceRule
    notes?: string
}

/**
 * Generate dates for recurring appointments
 */
function generateRecurringDates(
    startDate: Date,
    rule: RecurrenceRule
): Date[] {
    const dates: Date[] = [startDate]
    let currentDate = new Date(startDate)
    let count = 1

    const maxOccurrences = rule.occurrences || 52 // Default max 1 year
    const endDate = rule.endDate ? new Date(rule.endDate) : null

    while (count < maxOccurrences) {
        let nextDate: Date

        switch (rule.frequency) {
            case 'daily':
                nextDate = new Date(currentDate)
                nextDate.setDate(currentDate.getDate() + rule.interval)
                break

            case 'weekly':
                nextDate = new Date(currentDate)
                nextDate.setDate(currentDate.getDate() + (7 * rule.interval))

                // If specific days of week are set, find next matching day
                if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
                    const currentDay = nextDate.getDay()
                    const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b)

                    // Find next day in the list
                    let nextDay = sortedDays.find(d => d > currentDay)
                    if (!nextDay) {
                        // Wrap to next week
                        nextDay = sortedDays[0]
                        nextDate.setDate(nextDate.getDate() + (7 - currentDay + nextDay))
                    } else {
                        nextDate.setDate(nextDate.getDate() + (nextDay - currentDay))
                    }
                }
                break

            case 'monthly':
                nextDate = new Date(currentDate)
                nextDate.setMonth(currentDate.getMonth() + rule.interval)
                break

            default:
                return dates
        }

        if (endDate && nextDate > endDate) {
            break
        }

        dates.push(nextDate)
        currentDate = nextDate
        count++
    }

    return dates
}

/**
 * Create a recurring appointment series
 */
export async function createRecurringAppointment(data: CreateRecurringAppointmentData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('No clinic found')

    // Generate all dates for the series
    const dates = generateRecurringDates(data.start_time, data.recurrence_rule)

    // Create parent appointment (first in series)
    const endTime = new Date(data.start_time)
    endTime.setMinutes(endTime.getMinutes() + data.duration_minutes)

    const { data: parentAppointment, error: parentError } = await supabase
        .from('appointments')
        .insert({
            patient_id: data.patient_id,
            service_id: data.service_id,
            clinic_id: profile.clinic_id,
            start_time: data.start_time.toISOString(),
            end_time: endTime.toISOString(),
            status: 'pending',
            notes: data.notes || null,
            is_recurring: true,
            recurrence_rule: data.recurrence_rule,
            parent_appointment_id: null // This is the parent
        })
        .select()
        .single()

    if (parentError || !parentAppointment) {
        console.error('Error creating parent appointment:', parentError)
        throw new Error('Failed to create recurring appointment series')
    }

    // Create child appointments
    const childAppointments = dates.slice(1).map(date => {
        const end = new Date(date)
        end.setMinutes(end.getMinutes() + data.duration_minutes)

        return {
            patient_id: data.patient_id,
            service_id: data.service_id,
            clinic_id: profile.clinic_id,
            start_time: date.toISOString(),
            end_time: end.toISOString(),
            status: 'pending',
            notes: data.notes || null,
            is_recurring: true,
            recurrence_rule: data.recurrence_rule,
            parent_appointment_id: parentAppointment.id
        }
    })

    if (childAppointments.length > 0) {
        const { error: childError } = await supabase
            .from('appointments')
            .insert(childAppointments)

        if (childError) {
            console.error('Error creating child appointments:', childError)
            // Don't throw - parent was created successfully
        }
    }

    revalidatePath('/dashboard/agenda')
    return {
        parentId: parentAppointment.id,
        totalCreated: dates.length
    }
}

/**
 * Update a recurring series
 * @param scope - 'this_only', 'this_and_future', or 'all'
 */
export async function updateRecurringSeries(
    appointmentId: string,
    updates: { start_time?: Date; end_time?: Date; notes?: string },
    scope: 'this_only' | 'this_and_future' | 'all' = 'this_only'
) {
    const supabase = await createClient()

    // Get the appointment
    const { data: appointment } = await supabase
        .from('appointments')
        .select('*, parent_appointment_id, start_time')
        .eq('id', appointmentId)
        .single()

    if (!appointment) throw new Error('Appointment not found')

    const parentId = appointment.parent_appointment_id || appointment.id

    if (scope === 'this_only') {
        // Update only this appointment
        const { error } = await supabase
            .from('appointments')
            .update({
                start_time: updates.start_time?.toISOString(),
                end_time: updates.end_time?.toISOString(),
                notes: updates.notes
            })
            .eq('id', appointmentId)

        if (error) throw new Error('Failed to update appointment')
    } else if (scope === 'this_and_future') {
        // Update this and all future appointments in series
        const { error } = await supabase
            .from('appointments')
            .update({
                start_time: updates.start_time?.toISOString(),
                end_time: updates.end_time?.toISOString(),
                notes: updates.notes
            })
            .or(`id.eq.${appointmentId},and(parent_appointment_id.eq.${parentId},start_time.gte.${appointment.start_time})`)

        if (error) throw new Error('Failed to update appointments')
    } else {
        // Update all appointments in series
        const { error } = await supabase
            .from('appointments')
            .update({
                notes: updates.notes // Only notes for all
            })
            .or(`id.eq.${parentId},parent_appointment_id.eq.${parentId}`)

        if (error) throw new Error('Failed to update series')
    }

    revalidatePath('/dashboard/agenda')
}

/**
 * Delete a recurring series
 */
export async function deleteRecurringSeries(
    appointmentId: string,
    scope: 'this_only' | 'this_and_future' | 'all' = 'this_only'
) {
    const supabase = await createClient()

    const { data: appointment } = await supabase
        .from('appointments')
        .select('parent_appointment_id, start_time')
        .eq('id', appointmentId)
        .single()

    if (!appointment) throw new Error('Appointment not found')

    const parentId = appointment.parent_appointment_id || appointmentId

    if (scope === 'this_only') {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', appointmentId)

        if (error) throw new Error('Failed to delete appointment')
    } else if (scope === 'this_and_future') {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .or(`id.eq.${appointmentId},and(parent_appointment_id.eq.${parentId},start_time.gte.${appointment.start_time})`)

        if (error) throw new Error('Failed to delete appointments')
    } else {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .or(`id.eq.${parentId},parent_appointment_id.eq.${parentId}`)

        if (error) throw new Error('Failed to delete series')
    }

    revalidatePath('/dashboard/agenda')
}

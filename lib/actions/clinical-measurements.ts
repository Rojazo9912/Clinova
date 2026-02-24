'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface MeasurementData {
    patient_id: string
    metric: 'dolor' | 'movilidad' | 'fuerza' | 'flexibilidad' | 'body_map' | 'rom' | 'questionnaire'
    value?: number
    data?: any // JSONB for body map, ROM details, questionnaire answers
    body_region?: string
    session_id?: string
    notes?: string
}

export interface PatientProgress {
    metric: string
    body_region?: string
    firstValue: number
    lastValue: number
    changePercent: number
    trend: 'improving' | 'stable' | 'worsening'
    totalMeasurements: number
}

export async function addMeasurement(measurement: MeasurementData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Usuario no autenticado' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.clinic_id) return { success: false, message: 'No se encontró clínica' }

    // Validation
    if (measurement.metric === 'body_map' && !measurement.data) {
        return { success: false, message: 'El mapa corporal requiere datos' }
    }
    if (!['body_map', 'questionnaire'].includes(measurement.metric) && measurement.value === undefined) {
        return { success: false, message: 'La medición requiere un valor numérico' }
    }

    const { error } = await supabase
        .from('clinical_measurements')
        .insert({
            patient_id: measurement.patient_id,
            clinic_id: profile.clinic_id,
            created_by: user.id,
            metric: measurement.metric,
            value: measurement.value,
            data: measurement.data,
            body_region: measurement.body_region,
            session_id: measurement.session_id,
            notes: measurement.notes
        })

    if (error) {
        console.error('Error adding measurement:', error)
        return { success: false, message: 'Error al guardar la medición' }
    }

    revalidatePath(`/dashboard/patients/${measurement.patient_id}`)
    return { success: true }
}

export async function addMultipleMeasurements(measurements: MeasurementData[]) {
    const results = []
    for (const m of measurements) {
        const result = await addMeasurement(m)
        results.push(result)
    }
    return results
}

export async function getPatientMeasurements(patientId: string, metric?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('clinical_measurements')
        .select('*')
        .eq('patient_id', patientId)
        .order('measured_at', { ascending: true })

    if (metric) {
        query = query.eq('metric', metric)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching measurements:', error)
        return []
    }

    return data || []
}

export async function getPatientProgress(patientId: string): Promise<PatientProgress[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('clinical_measurements')
        .select('*')
        .eq('patient_id', patientId)
        .in('metric', ['dolor', 'movilidad', 'fuerza', 'flexibilidad', 'rom'])
        .order('measured_at', { ascending: true })

    if (error || !data || data.length === 0) return []

    // Group by metric + body_region
    const groups: Record<string, any[]> = {}
    for (const m of data) {
        const key = m.body_region ? `${m.metric}:${m.body_region}` : m.metric
        if (!groups[key]) groups[key] = []
        groups[key].push(m)
    }

    const progress: PatientProgress[] = []

    for (const [key, measurements] of Object.entries(groups)) {
        if (measurements.length < 1) continue

        const first = measurements[0]
        const last = measurements[measurements.length - 1]
        const firstVal = first.value
        const lastVal = last.value

        if (firstVal === null || lastVal === null) continue

        const change = firstVal === 0 ? 0 : ((lastVal - firstVal) / firstVal) * 100
        const [metric, region] = key.split(':')

        // For pain, decrease is improvement. For others, increase is improvement.
        let trend: 'improving' | 'stable' | 'worsening' = 'stable'
        if (metric === 'dolor') {
            if (change < -10) trend = 'improving'
            else if (change > 10) trend = 'worsening'
        } else {
            if (change > 10) trend = 'improving'
            else if (change < -10) trend = 'worsening'
        }

        progress.push({
            metric,
            body_region: region,
            firstValue: firstVal,
            lastValue: lastVal,
            changePercent: Math.round(change),
            trend,
            totalMeasurements: measurements.length
        })
    }

    return progress
}

export async function deleteMeasurement(id: string, patientId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('clinical_measurements')
        .delete()
        .eq('id', id)

    if (error) {
        return { success: false, message: 'Error al eliminar' }
    }

    revalidatePath(`/dashboard/patients/${patientId}`)
    return { success: true }
}

'use client'

import { useState } from 'react'
import { createMedicalRecord } from '@/lib/actions/medical-records'
import { createTreatmentPlan } from '@/lib/actions/treatment-plans'
import { toast } from 'sonner'

interface UseEvaluationWizardOptions {
    patientId: string
    patientName?: string
    onSuccess: () => void
}

export function useEvaluationWizard({ patientId, patientName, onSuccess }: UseEvaluationWizardOptions) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Step 1 — Chief complaint
    const [chiefComplaint, setChiefComplaint] = useState('')
    const [bodyRegion, setBodyRegion] = useState('')
    const [onsetDuration, setOnsetDuration] = useState('')
    const [painOnset, setPainOnset] = useState<'gradual' | 'sudden' | ''>('')
    const [worseAt, setWorseAt] = useState('')

    // Step 2 — Medical history
    const [chronicConditions, setChronicConditions] = useState<string[]>([])
    const [previousSurgeries, setPreviousSurgeries] = useState('')
    const [currentMedications, setCurrentMedications] = useState('')
    const [allergies, setAllergies] = useState('')
    const [previousPhysio, setPreviousPhysio] = useState<'yes' | 'no' | ''>('')

    // Step 3 — Physical exam
    const [initialPain, setInitialPain] = useState(5)
    const [posture, setPosture] = useState('')
    const [romNotes, setRomNotes] = useState('')
    const [strengthNotes, setStrengthNotes] = useState('')
    const [examFindings, setExamFindings] = useState('')

    // Step 4 — Diagnosis
    const [diagnosis, setDiagnosis] = useState('')
    const [goals, setGoals] = useState<string[]>([''])

    // Step 5 — Treatment plan
    const [planTitle, setPlanTitle] = useState('')
    const [totalSessions, setTotalSessions] = useState(12)
    const [frequency, setFrequency] = useState('3x_week')
    const [sessionPrice, setSessionPrice] = useState<number | ''>('')
    const [packagePrice, setPackagePrice] = useState<number | ''>('')
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])

    const initials = patientName
        ? patientName.split(' ').map(n => n[0]).slice(0, 2).join('')
        : '?'

    function toggleCondition(c: string) {
        setChronicConditions(prev =>
            prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
        )
    }

    function addGoal() { setGoals(g => [...g, '']) }
    function removeGoal(i: number) { setGoals(g => g.filter((_, idx) => idx !== i)) }
    function updateGoal(i: number, v: string) { setGoals(g => g.map((x, idx) => idx === i ? v : x)) }

    function canProceed(): boolean {
        if (step === 1) return chiefComplaint.trim().length > 3 && bodyRegion !== ''
        if (step === 4) return diagnosis.trim().length > 3
        if (step === 5) return planTitle.trim().length > 2 && totalSessions > 0
        return true
    }

    async function handleFinish() {
        setLoading(true)
        try {
            const structuredNotes = [
                `MOTIVO DE CONSULTA:\n${chiefComplaint}`,
                `ZONA AFECTADA: ${bodyRegion}`,
                `INICIO: ${onsetDuration}${painOnset ? ` (${painOnset === 'gradual' ? 'inicio gradual' : 'inicio súbito'})` : ''}`,
                worseAt ? `EMPEORA CON: ${worseAt}` : '',
                chronicConditions.length > 0 ? `\nANTECEDENTES PATOLÓGICOS:\n${chronicConditions.join(', ')}` : '',
                previousSurgeries ? `CIRUGÍAS PREVIAS: ${previousSurgeries}` : '',
                currentMedications ? `MEDICAMENTOS: ${currentMedications}` : '',
                allergies ? `ALERGIAS: ${allergies}` : '',
                previousPhysio === 'yes' ? 'FISIOTERAPIA PREVIA: Sí' : '',
                `\nEXPLORACIÓN FÍSICA:`,
                `• Dolor inicial (EVA): ${initialPain}/10`,
                posture ? `• Postura: ${posture}` : '',
                romNotes ? `• ROM: ${romNotes}` : '',
                strengthNotes ? `• Fuerza: ${strengthNotes}` : '',
                examFindings ? `• Hallazgos: ${examFindings}` : '',
                `\nDIAGNÓSTICO FISIOTERAPÉUTICO:\n${diagnosis}`,
                goals.filter(g => g.trim()).length > 0
                    ? `\nOBJETIVOS DEL TRATAMIENTO:\n${goals.filter(g => g.trim()).map(g => `• ${g}`).join('\n')}`
                    : '',
            ].filter(Boolean).join('\n')

            await createMedicalRecord({
                patient_id: patientId,
                diagnosis,
                treatment_plan: `Plan: ${planTitle} · ${totalSessions} sesiones · ${frequency}`,
                notes: structuredNotes,
            })

            const start = new Date(startDate)
            const sessionsPerWeek =
                frequency === 'daily' ? 5
                : frequency === '3x_week' ? 3
                : frequency === '2x_week' ? 2 : 1
            const weeksNeeded = Math.ceil(totalSessions / sessionsPerWeek)
            start.setDate(start.getDate() + weeksNeeded * 7)
            const estimatedEnd = start.toISOString().split('T')[0]

            await createTreatmentPlan({
                patient_id: patientId,
                title: planTitle,
                diagnosis,
                total_sessions: totalSessions,
                frequency,
                session_price: sessionPrice !== '' ? Number(sessionPrice) : undefined,
                package_price: packagePrice !== '' ? Number(packagePrice) : undefined,
                start_date: startDate,
                estimated_end_date: estimatedEnd,
                goals: goals.filter(g => g.trim()).map((g, i) => ({
                    id: `goal_${i}`,
                    description: g,
                    achieved: false,
                })),
                notes: `Evaluación inicial realizada el ${new Date().toLocaleDateString('es-MX')}`,
            })

            toast.success('Expediente inicial creado exitosamente')
            onSuccess()
        } catch (err) {
            console.error(err)
            toast.error('Error al guardar el expediente')
        } finally {
            setLoading(false)
        }
    }

    return {
        // navigation
        step, setStep,
        loading,
        initials,
        canProceed,
        handleFinish,
        // step 1
        chiefComplaint, setChiefComplaint,
        bodyRegion, setBodyRegion,
        onsetDuration, setOnsetDuration,
        painOnset, setPainOnset,
        worseAt, setWorseAt,
        // step 2
        chronicConditions, toggleCondition,
        previousSurgeries, setPreviousSurgeries,
        currentMedications, setCurrentMedications,
        allergies, setAllergies,
        previousPhysio, setPreviousPhysio,
        // step 3
        initialPain, setInitialPain,
        posture, setPosture,
        romNotes, setRomNotes,
        strengthNotes, setStrengthNotes,
        examFindings, setExamFindings,
        // step 4
        diagnosis, setDiagnosis,
        goals, addGoal, removeGoal, updateGoal,
        // step 5
        planTitle, setPlanTitle,
        totalSessions, setTotalSessions,
        frequency, setFrequency,
        sessionPrice, setSessionPrice,
        packagePrice, setPackagePrice,
        startDate, setStartDate,
    }
}

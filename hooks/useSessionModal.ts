'use client'

import { useState, useEffect, useRef } from 'react'
import { createTherapySession, getTherapySessions } from '@/lib/actions/medical-records'
import { getNoteTemplates, NoteTemplate } from '@/lib/actions/note-templates'
import { getExercises, assignExerciseToPatient, Exercise } from '@/lib/actions/exercises'
import { addMeasurement } from '@/lib/actions/clinical-measurements'
import { getActivePlanForPatient, incrementPlanSession } from '@/lib/actions/treatment-plans'
import { toast } from 'sonner'

export const PROGRESS_OPTIONS = [
    { value: 1, emoji: '😞', label: 'Sin avance', accent: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: '#fca5a5' },
    { value: 2, emoji: '😐', label: 'Leve', accent: '#f97316', bg: 'rgba(249,115,22,0.08)', border: '#fdba74' },
    { value: 3, emoji: '🙂', label: 'Moderado', accent: '#eab308', bg: 'rgba(234,179,8,0.08)', border: '#fde047' },
    { value: 4, emoji: '😊', label: 'Bueno', accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: '#93c5fd' },
    { value: 5, emoji: '🌟', label: 'Excelente', accent: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: '#86efac' },
]

export const DURATIONS = [30, 45, 60, 90]
export const FREQUENCIES = [
    { value: 'daily', label: 'Diario' },
    { value: '3x_week', label: '3x/sem' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'as_needed', label: 'C/necesidad' },
]

interface UseSessionModalOptions {
    isOpen: boolean
    patientId: string
    patientName?: string
    patientAge?: number
    onSuccess: () => void
}

export function useSessionModal({ isOpen, patientId, patientName, patientAge, onSuccess }: UseSessionModalOptions) {
    const [loading, setLoading] = useState(false)
    const [templates, setTemplates] = useState<NoteTemplate[]>([])
    const [notes, setNotes] = useState('')
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [exerciseSearch, setExerciseSearch] = useState('')
    const [selectedExercises, setSelectedExercises] = useState<Array<{ exercise_id: string, frequency: string }>>([])
    const [showExercises, setShowExercises] = useState(false)
    const [showMetrics, setShowMetrics] = useState(false)
    const [showPrevSession, setShowPrevSession] = useState(false)
    const [activePlan, setActivePlan] = useState<{ id: string; title: string; total_sessions: number; completed_sessions: number } | null>(null)
    const [linkToPlan, setLinkToPlan] = useState(true)
    const [progressRating, setProgressRating] = useState(3)
    const [pain, setPain] = useState<number | null>(null)
    const [mobility, setMobility] = useState<number | null>(null)
    const [strength, setStrength] = useState<number | null>(null)
    const [lastSession, setLastSession] = useState<{ session_date: string; notes: string } | null>(null)
    const [duration, setDuration] = useState(60)
    const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 16))
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const selectedProgress = PROGRESS_OPTIONS.find(p => p.value === progressRating)!
    const initials = patientName ? patientName.split(' ').map(n => n[0]).slice(0, 2).join('') : '?'
    const filteredExercises = exercises.filter(e =>
        !exerciseSearch || e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) || e.category?.toLowerCase().includes(exerciseSearch.toLowerCase())
    )

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                getNoteTemplates().then(d => setTemplates(d as NoteTemplate[])),
                getExercises().then(d => setExercises(d as Exercise[])),
                getActivePlanForPatient(patientId).then(d => setActivePlan(d as typeof activePlan)),
                getTherapySessions(patientId).then(sessions => setLastSession(((sessions as { session_date: string; notes: string }[]))?.[0] ?? null))
            ])
            setNotes(''); setSelectedExercises([]); setProgressRating(3)
            setPain(null); setMobility(null); setStrength(null)
            setSessionDate(new Date().toISOString().slice(0, 16))
            setShowExercises(false); setShowMetrics(false); setShowPrevSession(false)
            setExerciseSearch('')
        }
    }, [isOpen, patientId])

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current
        if (!ta) return
        ta.style.height = 'auto'
        ta.style.height = `${Math.max(120, ta.scrollHeight)}px`
    }, [notes])

    function applyTemplate(id: string) {
        const t = templates.find(t => t.id === id)
        if (!t) return
        let content = t.content
        const vars: Record<string, string> = {
            patient_name: patientName || '[Paciente]',
            patient_age: patientAge?.toString() || '[Edad]',
            date: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
            therapist_name: '[Fisioterapeuta]', service: '[Tratamiento]', session_number: '1'
        }
        Object.entries(vars).forEach(([k, v]) => { content = content.replace(new RegExp(`\\{${k}\\}`, 'g'), v) })
        setNotes(content)
        textareaRef.current?.focus()
    }

    function toggleExercise(id: string) {
        const exists = selectedExercises.find(e => e.exercise_id === id)
        setSelectedExercises(exists
            ? selectedExercises.filter(e => e.exercise_id !== id)
            : [...selectedExercises, { exercise_id: id, frequency: 'daily' }]
        )
    }

    function updateExerciseFrequency(exerciseId: string, frequency: string) {
        setSelectedExercises(selectedExercises.map(s => s.exercise_id === exerciseId ? { ...s, frequency } : s))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!notes.trim()) { toast.error('Las notas son requeridas'); return }
        setLoading(true)
        try {
            await createTherapySession({ patient_id: patientId, session_date: sessionDate, duration_minutes: duration, notes, exercises: [], progress_rating: progressRating })
            await Promise.all([
                ...selectedExercises.map(ex => assignExerciseToPatient({ patient_id: patientId, exercise_id: ex.exercise_id, frequency: ex.frequency }).catch(() => {})),
                pain !== null ? addMeasurement({ patient_id: patientId, metric: 'dolor', value: pain }) : Promise.resolve(),
                mobility !== null ? addMeasurement({ patient_id: patientId, metric: 'movilidad', value: mobility }) : Promise.resolve(),
                strength !== null ? addMeasurement({ patient_id: patientId, metric: 'fuerza', value: strength }) : Promise.resolve(),
            ])
            if (activePlan && linkToPlan) await incrementPlanSession(activePlan.id)
            toast.success('Sesión guardada exitosamente')
            onSuccess()
        } catch { toast.error('Error al guardar la sesión') }
        finally { setLoading(false) }
    }

    return {
        // state
        loading,
        templates,
        notes, setNotes,
        exercises,
        exerciseSearch, setExerciseSearch,
        selectedExercises,
        showExercises, setShowExercises,
        showMetrics, setShowMetrics,
        showPrevSession, setShowPrevSession,
        activePlan,
        linkToPlan, setLinkToPlan,
        progressRating, setProgressRating,
        pain, setPain,
        mobility, setMobility,
        strength, setStrength,
        lastSession,
        duration, setDuration,
        sessionDate, setSessionDate,
        // computed
        selectedProgress,
        initials,
        filteredExercises,
        textareaRef,
        // handlers
        applyTemplate,
        toggleExercise,
        updateExerciseFrequency,
        handleSubmit,
    }
}

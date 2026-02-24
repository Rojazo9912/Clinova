'use client'

import { useState, useEffect } from 'react'
import { createTherapySession } from '@/lib/actions/medical-records'
import { getNoteTemplates, NoteTemplate } from '@/lib/actions/note-templates'
import { getExercises, assignExerciseToPatient, Exercise } from '@/lib/actions/exercises'
import { addMeasurement } from '@/lib/actions/clinical-measurements'
import { getActivePlanForPatient, incrementPlanSession } from '@/lib/actions/treatment-plans'
import { X, FileText, Dumbbell, Plus, CheckCircle2, Activity, ClipboardList } from 'lucide-react'

interface SessionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    patientId: string
    patientName?: string
    patientAge?: number
}

const FREQUENCIES = [
    { value: 'daily', label: 'Diario' },
    { value: '2x_day', label: '2 veces al día' },
    { value: '3x_week', label: '3 veces por semana' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'as_needed', label: 'Según sea necesario' }
]

export default function SessionModal({ isOpen, onClose, onSuccess, patientId, patientName, patientAge }: SessionModalProps) {
    const [loading, setLoading] = useState(false)
    const [templates, setTemplates] = useState<NoteTemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<string>('')
    const [notes, setNotes] = useState('')
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [selectedExercises, setSelectedExercises] = useState<Array<{ exercise_id: string, frequency: string, notes: string }>>([])
    const [showExerciseSelector, setShowExerciseSelector] = useState(false)
    const [showMetrics, setShowMetrics] = useState(false)
    const [activePlan, setActivePlan] = useState<any>(null)
    const [linkToPlan, setLinkToPlan] = useState(true)
    const [painLevel, setPainLevel] = useState<number | null>(null)
    const [mobilityLevel, setMobilityLevel] = useState<number | null>(null)
    const [strengthLevel, setStrengthLevel] = useState<number | null>(null)

    useEffect(() => {
        if (isOpen) {
            loadTemplates()
            loadExercises()
            loadActivePlan()
        }
    }, [isOpen])

    async function loadActivePlan() {
        const plan = await getActivePlanForPatient(patientId)
        setActivePlan(plan)
    }

    async function loadTemplates() {
        const data = await getNoteTemplates()
        setTemplates(data as NoteTemplate[])
    }

    async function loadExercises() {
        const data = await getExercises()
        setExercises(data as Exercise[])
    }

    function applyTemplate(templateId: string) {
        const template = templates.find(t => t.id === templateId)
        if (!template) return

        let content = template.content
        const now = new Date()

        const variables: Record<string, string> = {
            patient_name: patientName || '[Nombre del Paciente]',
            patient_age: patientAge?.toString() || '[Edad]',
            date: now.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
            therapist_name: '[Fisioterapeuta]',
            service: '[Servicio]',
            session_number: '1'
        }

        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`\\{${key}\\}`, 'g')
            content = content.replace(regex, value)
        })

        setNotes(content)
    }

    function toggleExercise(exerciseId: string) {
        const exists = selectedExercises.find(e => e.exercise_id === exerciseId)
        if (exists) {
            setSelectedExercises(selectedExercises.filter(e => e.exercise_id !== exerciseId))
        } else {
            setSelectedExercises([...selectedExercises, { exercise_id: exerciseId, frequency: 'daily', notes: '' }])
        }
    }

    function updateExerciseDetails(exerciseId: string, field: 'frequency' | 'notes', value: string) {
        setSelectedExercises(selectedExercises.map(e =>
            e.exercise_id === exerciseId ? { ...e, [field]: value } : e
        ))
    }

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)

            await createTherapySession({
                patient_id: patientId,
                session_date: formData.get('session_date') as string,
                duration_minutes: parseInt(formData.get('duration_minutes') as string),
                notes: notes,
                exercises: [],
                progress_rating: parseInt(formData.get('progress_rating') as string)
            })

            // Assign exercises to patient
            for (const ex of selectedExercises) {
                try {
                    await assignExerciseToPatient({
                        patient_id: patientId,
                        exercise_id: ex.exercise_id,
                        frequency: ex.frequency,
                        notes: ex.notes || undefined
                    })
                } catch (error) {
                    // Si ya existe, continuamos con el siguiente
                    console.log('Exercise already assigned or error:', error)
                }
            }

            // Save clinical measurements
            if (painLevel !== null) {
                await addMeasurement({ patient_id: patientId, metric: 'dolor', value: painLevel })
            }
            if (mobilityLevel !== null) {
                await addMeasurement({ patient_id: patientId, metric: 'movilidad', value: mobilityLevel })
            }
            if (strengthLevel !== null) {
                await addMeasurement({ patient_id: patientId, metric: 'fuerza', value: strengthLevel })
            }

            // Increment treatment plan session counter
            if (activePlan && linkToPlan) {
                await incrementPlanSession(activePlan.id)
            }

            setNotes('')
            setSelectedTemplate('')
            setSelectedExercises([])
            setPainLevel(null)
            setMobilityLevel(null)
            setStrengthLevel(null)
            onSuccess()
        } catch (error) {
            alert('Error al crear sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Nueva Sesión de Terapia</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha de Sesión *</label>
                            <input
                                type="datetime-local"
                                name="session_date"
                                required
                                defaultValue={new Date().toISOString().slice(0, 16)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Duración (minutos) *</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                required
                                defaultValue={60}
                                min="1"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Active Treatment Plan Banner */}
                    {activePlan && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ClipboardList className="w-5 h-5 text-emerald-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-900">{activePlan.title}</p>
                                        <p className="text-xs text-emerald-700">
                                            Sesión {(activePlan.completed_sessions || 0) + 1} de {activePlan.total_sessions}
                                            {activePlan.frequency && ` · ${activePlan.frequency}`}
                                        </p>
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={linkToPlan}
                                        onChange={(e) => setLinkToPlan(e.target.checked)}
                                        className="w-4 h-4 text-emerald-600 rounded"
                                    />
                                    <span className="text-xs text-emerald-700">Contar sesión</span>
                                </label>
                            </div>
                            <div className="mt-2 w-full bg-emerald-200 rounded-full h-1.5">
                                <div
                                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                    style={{ width: `${Math.round(((activePlan.completed_sessions || 0) / activePlan.total_sessions) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {templates.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Usar Plantilla (Opcional)</label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => {
                                        setSelectedTemplate(e.target.value)
                                        if (e.target.value) {
                                            applyTemplate(e.target.value)
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Sin plantilla</option>
                                    {templates.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.name} ({template.category})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNotes('')
                                        setSelectedTemplate('')
                                    }}
                                    className="px-3 py-2 border rounded-lg hover:bg-slate-50 text-sm"
                                    title="Limpiar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Notas de la Sesión *</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                            rows={8}
                            placeholder="Describe el progreso del paciente, ejercicios realizados, observaciones... O selecciona una plantilla arriba."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        />
                        {selectedTemplate && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Plantilla aplicada - puedes editar el texto
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Calificación de Progreso *</label>
                        <select
                            name="progress_rating"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="1">1 - Sin progreso</option>
                            <option value="2">2 - Progreso mínimo</option>
                            <option value="3">3 - Progreso moderado</option>
                            <option value="4">4 - Buen progreso</option>
                            <option value="5">5 - Excelente progreso</option>
                        </select>
                    </div>

                    {/* Quick Metrics Section */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-600" />
                                Escalas de Valoración (Opcional)
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowMetrics(!showMetrics)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                            >
                                {showMetrics ? 'Ocultar' : 'Registrar Métricas'}
                            </button>
                        </div>

                        {showMetrics && (
                            <div className="grid grid-cols-3 gap-4 bg-slate-50 rounded-lg p-4">
                                {/* Pain EVA */}
                                <div className="text-center">
                                    <label className="block text-xs font-medium text-red-600 mb-2">Dolor (EVA)</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        value={painLevel ?? 0}
                                        onChange={(e) => setPainLevel(parseInt(e.target.value))}
                                        className="w-full accent-red-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                        <span>0</span>
                                        <span>5</span>
                                        <span>10</span>
                                    </div>
                                    <span className={`text-lg font-bold ${painLevel !== null ? 'text-red-600' : 'text-slate-300'}`}>
                                        {painLevel !== null ? `${painLevel}/10` : '-'}
                                    </span>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {painLevel === null ? 'Sin registrar' : painLevel === 0 ? 'Sin dolor' : painLevel <= 3 ? 'Leve' : painLevel <= 7 ? 'Moderado' : 'Severo'}
                                    </p>
                                    {painLevel !== null && (
                                        <button type="button" onClick={() => setPainLevel(null)} className="text-[10px] text-slate-400 hover:text-red-500 mt-1">Limpiar</button>
                                    )}
                                </div>

                                {/* Mobility */}
                                <div className="text-center">
                                    <label className="block text-xs font-medium text-blue-600 mb-2">Movilidad</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        value={mobilityLevel ?? 5}
                                        onChange={(e) => setMobilityLevel(parseInt(e.target.value))}
                                        className="w-full accent-blue-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                        <span>0</span>
                                        <span>5</span>
                                        <span>10</span>
                                    </div>
                                    <span className={`text-lg font-bold ${mobilityLevel !== null ? 'text-blue-600' : 'text-slate-300'}`}>
                                        {mobilityLevel !== null ? `${mobilityLevel}/10` : '-'}
                                    </span>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {mobilityLevel === null ? 'Sin registrar' : mobilityLevel <= 3 ? 'Limitada' : mobilityLevel <= 7 ? 'Moderada' : 'Completa'}
                                    </p>
                                    {mobilityLevel !== null && (
                                        <button type="button" onClick={() => setMobilityLevel(null)} className="text-[10px] text-slate-400 hover:text-blue-500 mt-1">Limpiar</button>
                                    )}
                                </div>

                                {/* Strength */}
                                <div className="text-center">
                                    <label className="block text-xs font-medium text-green-600 mb-2">Fuerza</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        value={strengthLevel ?? 5}
                                        onChange={(e) => setStrengthLevel(parseInt(e.target.value))}
                                        className="w-full accent-green-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                        <span>0</span>
                                        <span>5</span>
                                        <span>10</span>
                                    </div>
                                    <span className={`text-lg font-bold ${strengthLevel !== null ? 'text-green-600' : 'text-slate-300'}`}>
                                        {strengthLevel !== null ? `${strengthLevel}/10` : '-'}
                                    </span>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {strengthLevel === null ? 'Sin registrar' : strengthLevel <= 3 ? 'Débil' : strengthLevel <= 7 ? 'Moderada' : 'Fuerte'}
                                    </p>
                                    {strengthLevel !== null && (
                                        <button type="button" onClick={() => setStrengthLevel(null)} className="text-[10px] text-slate-400 hover:text-green-500 mt-1">Limpiar</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Exercise Assignment Section */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium">Asignar Ejercicios (Opcional)</label>
                            <button
                                type="button"
                                onClick={() => setShowExerciseSelector(!showExerciseSelector)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            >
                                <Plus className="w-4 h-4" />
                                {showExerciseSelector ? 'Ocultar' : 'Agregar Ejercicios'}
                            </button>
                        </div>

                        {/* Selected Exercises */}
                        {selectedExercises.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {selectedExercises.map(sel => {
                                    const exercise = exercises.find(e => e.id === sel.exercise_id)
                                    if (!exercise) return null
                                    return (
                                        <div key={sel.exercise_id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">{exercise.name}</h4>
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        <select
                                                            value={sel.frequency}
                                                            onChange={(e) => updateExerciseDetails(sel.exercise_id, 'frequency', e.target.value)}
                                                            className="text-xs px-2 py-1 border rounded"
                                                        >
                                                            {FREQUENCIES.map(f => (
                                                                <option key={f.value} value={f.value}>{f.label}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleExercise(sel.exercise_id)}
                                                            className="text-xs text-red-600 hover:text-red-700"
                                                        >
                                                            Quitar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Exercise Selector */}
                        {showExerciseSelector && (
                            <div className="border rounded-lg p-4 bg-slate-50 max-h-64 overflow-y-auto">
                                <div className="space-y-2">
                                    {exercises.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">
                                            No hay ejercicios disponibles. Crea ejercicios primero.
                                        </p>
                                    ) : (
                                        exercises.map(exercise => {
                                            const isSelected = selectedExercises.some(e => e.exercise_id === exercise.id)
                                            return (
                                                <button
                                                    key={exercise.id}
                                                    type="button"
                                                    onClick={() => toggleExercise(exercise.id)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                                                        isSelected
                                                            ? 'bg-blue-100 border-blue-300 text-blue-900'
                                                            : 'bg-white border-slate-200 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Dumbbell className="w-4 h-4" />
                                                        <span className="font-medium text-sm">{exercise.name}</span>
                                                        <span className="text-xs text-slate-500">({exercise.category})</span>
                                                    </div>
                                                </button>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar Sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

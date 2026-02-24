'use client'

import { useEffect, useState } from 'react'
import { getPatientExercises, updateExerciseStatus, PatientExercise } from '@/lib/actions/exercises'
import { Dumbbell, CheckCircle2, Play } from 'lucide-react'

const CATEGORIES = {
    mobility: '🏃 Movilidad',
    strength: '💪 Fuerza',
    stretching: '🧘 Estiramiento',
    balance: '⚖️ Equilibrio',
    breathing: '🫁 Respiración',
    functional: '🔄 Funcional'
}

const DIFFICULTIES = {
    beginner: { label: 'Principiante', color: 'green' },
    intermediate: { label: 'Intermedio', color: 'yellow' },
    advanced: { label: 'Avanzado', color: 'red' }
}

export default function ExercisesPage() {
    const [assignments, setAssignments] = useState<PatientExercise[]>([])
    const [selectedExercise, setSelectedExercise] = useState<PatientExercise | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        loadExercises()
    }, [refreshKey])

    async function loadExercises() {
        setLoading(true)
        // Get patient ID from session
        const response = await fetch('/api/auth/session')
        const session = await response.json()

        if (session?.user) {
            const data = await getPatientExercises(session.user.id)
            setAssignments(data as PatientExercise[])
        }
        setLoading(false)
    }

    async function handleMarkComplete(id: string) {
        try {
            await updateExerciseStatus(id, 'completed')
            setRefreshKey(prev => prev + 1)
            setSelectedExercise(null)
        } catch (error: any) {
            alert('Error: ' + error.message)
        }
    }

    const activeExercises = assignments.filter(a => a.status === 'active')
    const completedExercises = assignments.filter(a => a.status === 'completed')

    if (loading) {
        return (
            <div className="p-8">
                <div className="text-center py-12 text-slate-500">Cargando ejercicios...</div>
            </div>
        )
    }

    if (assignments.length === 0) {
        return (
            <div className="p-8">
                <div className="text-center py-12">
                    <Dumbbell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">No tienes ejercicios asignados</h2>
                    <p className="text-slate-600">
                        Tu fisioterapeuta te asignará ejercicios personalizados en tu próxima sesión.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Mis Ejercicios</h1>
                <p className="text-slate-600 mt-2">
                    Ejercicios personalizados para tu recuperación
                </p>
            </div>

            {/* Active Exercises */}
            {activeExercises.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Ejercicios Activos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeExercises.map(assignment => {
                            const exercise = assignment.exercises
                            if (!exercise) return null

                            const diffInfo = DIFFICULTIES[exercise.difficulty as keyof typeof DIFFICULTIES]

                            return (
                                <div
                                    key={assignment.id}
                                    onClick={() => setSelectedExercise(assignment)}
                                    className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer"
                                >
                                    {exercise.image_url && (
                                        <div className="h-40 bg-slate-100 overflow-hidden">
                                            <img
                                                src={exercise.image_url}
                                                alt={exercise.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{exercise.name}</h3>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                    {CATEGORIES[exercise.category as keyof typeof CATEGORIES]}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full bg-${diffInfo.color}-100 text-${diffInfo.color}-700`}>
                                                    {diffInfo.label}
                                                </span>
                                            </div>
                                        </div>

                                        {assignment.frequency && (
                                            <p className="text-sm text-slate-600">
                                                <strong>Frecuencia:</strong> {assignment.frequency}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            {exercise.duration_minutes && (
                                                <span>⏱️ {exercise.duration_minutes} min</span>
                                            )}
                                            {exercise.repetitions && (
                                                <span>🔄 {exercise.repetitions}</span>
                                            )}
                                            {exercise.sets && (
                                                <span>📊 {exercise.sets} series</span>
                                            )}
                                        </div>

                                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                            <Play className="w-4 h-4" />
                                            Ver Detalles
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Completed Exercises */}
            {completedExercises.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Ejercicios Completados</h2>
                    <div className="space-y-2">
                        {completedExercises.map(assignment => {
                            const exercise = assignment.exercises
                            if (!exercise) return null

                            return (
                                <div key={assignment.id} className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        <div>
                                            <h4 className="font-medium text-slate-900">{exercise.name}</h4>
                                            <p className="text-sm text-slate-600">
                                                Completado el {new Date(assignment.completed_date!).toLocaleDateString('es-MX')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Exercise Detail Modal */}
            {selectedExercise && selectedExercise.exercises && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {selectedExercise.exercises.image_url && (
                                <div className="rounded-lg overflow-hidden">
                                    <img
                                        src={selectedExercise.exercises.image_url}
                                        alt={selectedExercise.exercises.name}
                                        className="w-full h-64 object-cover"
                                    />
                                </div>
                            )}

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    {selectedExercise.exercises.name}
                                </h2>
                                <div className="flex gap-2">
                                    <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                        {CATEGORIES[selectedExercise.exercises.category as keyof typeof CATEGORIES]}
                                    </span>
                                    <span className={`text-sm px-3 py-1 rounded-full bg-${DIFFICULTIES[selectedExercise.exercises.difficulty as keyof typeof DIFFICULTIES].color}-100 text-${DIFFICULTIES[selectedExercise.exercises.difficulty as keyof typeof DIFFICULTIES].color}-700`}>
                                        {DIFFICULTIES[selectedExercise.exercises.difficulty as keyof typeof DIFFICULTIES].label}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                                {selectedExercise.exercises.duration_minutes && (
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {selectedExercise.exercises.duration_minutes}
                                        </div>
                                        <div className="text-sm text-slate-600">minutos</div>
                                    </div>
                                )}
                                {selectedExercise.exercises.repetitions && (
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {selectedExercise.exercises.repetitions}
                                        </div>
                                        <div className="text-sm text-slate-600">repeticiones</div>
                                    </div>
                                )}
                                {selectedExercise.exercises.sets && (
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {selectedExercise.exercises.sets}
                                        </div>
                                        <div className="text-sm text-slate-600">series</div>
                                    </div>
                                )}
                            </div>

                            {selectedExercise.frequency && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h3 className="font-semibold text-blue-900 mb-1">Frecuencia Recomendada</h3>
                                    <p className="text-blue-700">{selectedExercise.frequency}</p>
                                </div>
                            )}

                            {selectedExercise.notes && (
                                <div className="p-4 bg-amber-50 rounded-lg">
                                    <h3 className="font-semibold text-amber-900 mb-1">Notas de tu Fisioterapeuta</h3>
                                    <p className="text-amber-700">{selectedExercise.notes}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold text-slate-900 mb-2">Instrucciones</h3>
                                <div className="prose prose-sm max-w-none">
                                    <pre className="whitespace-pre-wrap text-slate-700 font-sans">
                                        {selectedExercise.exercises.description}
                                    </pre>
                                </div>
                            </div>

                            {selectedExercise.exercises.video_url && (
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Video Demostrativo</h3>
                                    <a
                                        href={selectedExercise.exercises.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Ver video →
                                    </a>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={() => handleMarkComplete(selectedExercise.id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Marcar como Completado
                                </button>
                                <button
                                    onClick={() => setSelectedExercise(null)}
                                    className="px-4 py-3 border rounded-lg hover:bg-slate-50"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

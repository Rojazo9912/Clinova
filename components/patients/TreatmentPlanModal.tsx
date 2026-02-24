'use client'

import { useState } from 'react'
import { createTreatmentPlan, TreatmentPlanGoal } from '@/lib/actions/treatment-plans'
import { X, Plus, Target, Trash2 } from 'lucide-react'

interface TreatmentPlanModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    patientId: string
}

export default function TreatmentPlanModal({ isOpen, onClose, onSuccess, patientId }: TreatmentPlanModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [goals, setGoals] = useState<TreatmentPlanGoal[]>([])
    const [newGoal, setNewGoal] = useState('')

    if (!isOpen) return null

    const addGoal = () => {
        if (!newGoal.trim()) return
        setGoals([...goals, {
            id: crypto.randomUUID(),
            description: newGoal.trim(),
            achieved: false,
        }])
        setNewGoal('')
    }

    const removeGoal = (id: string) => {
        setGoals(goals.filter(g => g.id !== id))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        try {
            const result = await createTreatmentPlan({
                patient_id: patientId,
                title: formData.get('title') as string,
                diagnosis: formData.get('diagnosis') as string || undefined,
                total_sessions: parseInt(formData.get('total_sessions') as string) || 1,
                frequency: formData.get('frequency') as string || undefined,
                package_price: parseFloat(formData.get('package_price') as string) || undefined,
                start_date: formData.get('start_date') as string || undefined,
                estimated_end_date: formData.get('estimated_end_date') as string || undefined,
                goals,
                notes: formData.get('notes') as string || undefined,
            })

            if (result.success) {
                setGoals([])
                setNewGoal('')
                onSuccess()
                onClose()
            } else {
                setError(result.message || 'Error al crear plan')
            }
        } catch (err) {
            setError('Error al crear el plan de tratamiento.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "mt-1 block w-full rounded-lg border border-slate-300 shadow-sm p-2.5 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-slate-900">Nuevo Plan de Tratamiento</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" id="plan-form">
                        {/* Plan Info */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Título del plan *</label>
                            <input
                                name="title"
                                required
                                placeholder="Ej: Rehabilitación Lumbar, Post-quirúrgico Rodilla..."
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Diagnóstico</label>
                            <textarea
                                name="diagnosis"
                                rows={2}
                                placeholder="Diagnóstico clínico del paciente..."
                                className={inputClass + " resize-none"}
                            />
                        </div>

                        {/* Session Package */}
                        <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                            <h3 className="text-sm font-semibold text-blue-900">Paquete de Sesiones</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Total sesiones *</label>
                                    <input
                                        type="number"
                                        name="total_sessions"
                                        min="1"
                                        max="100"
                                        defaultValue="10"
                                        required
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Frecuencia</label>
                                    <select name="frequency" className={inputClass}>
                                        <option value="">Sin definir</option>
                                        <option value="diario">Diario</option>
                                        <option value="2x_semana">2x por semana</option>
                                        <option value="3x_semana">3x por semana</option>
                                        <option value="semanal">Semanal</option>
                                        <option value="quincenal">Quincenal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Precio paquete</label>
                                    <input
                                        type="number"
                                        name="package_price"
                                        min="0"
                                        step="0.01"
                                        placeholder="$0.00"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Fecha inicio</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Fecha estimada fin</label>
                                <input type="date" name="estimated_end_date" className={inputClass} />
                            </div>
                        </div>

                        {/* Goals */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                                <Target className="w-4 h-4 text-emerald-600" />
                                Objetivos del Tratamiento
                            </h3>

                            {goals.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    {goals.map((goal) => (
                                        <div key={goal.id} className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2">
                                            <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            <span className="text-sm text-slate-700 flex-1">{goal.description}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeGoal(goal.id)}
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    value={newGoal}
                                    onChange={(e) => setNewGoal(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGoal() } }}
                                    placeholder="Ej: Reducir dolor a EVA 3 o menos"
                                    className={inputClass + " flex-1"}
                                />
                                <button
                                    type="button"
                                    onClick={addGoal}
                                    className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 shrink-0"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Notas adicionales</label>
                            <textarea
                                name="notes"
                                rows={2}
                                placeholder="Observaciones, precauciones, indicaciones especiales..."
                                className={inputClass + " resize-none"}
                            />
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="plan-form"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {loading ? 'Creando...' : 'Crear Plan'}
                    </button>
                </div>
            </div>
        </div>
    )
}

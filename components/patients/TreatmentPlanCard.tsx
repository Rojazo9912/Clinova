'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateGoalStatus, dischargePlan, updateTreatmentPlan, TreatmentPlan, TreatmentPlanGoal } from '@/lib/actions/treatment-plans'
import TreatmentPlanModal from './TreatmentPlanModal'
import {
    ClipboardList, Target, CheckCircle2, Circle, Calendar, DollarSign,
    Plus, ChevronDown, ChevronUp, LogOut, Pause, Play
} from 'lucide-react'

const FREQUENCY_LABELS: Record<string, string> = {
    diario: 'Diario',
    '2x_semana': '2x por semana',
    '3x_semana': '3x por semana',
    semanal: 'Semanal',
    quincenal: 'Quincenal',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Activo', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    completed: { label: 'Completado', color: 'text-blue-700', bg: 'bg-blue-100' },
    paused: { label: 'Pausado', color: 'text-amber-700', bg: 'bg-amber-100' },
    cancelled: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100' },
}

const DISCHARGE_REASONS: Record<string, string> = {
    completed: 'Objetivos cumplidos',
    patient_request: 'Solicitud del paciente',
    no_improvement: 'Sin mejoría',
    referred: 'Referido a otro especialista',
    other: 'Otro motivo',
}

interface TreatmentPlanCardProps {
    plans: TreatmentPlan[]
    patientId: string
}

export default function TreatmentPlanCard({ plans, patientId }: TreatmentPlanCardProps) {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [expandedPlan, setExpandedPlan] = useState<string | null>(plans.find(p => p.status === 'active')?.id || null)
    const [showDischarge, setShowDischarge] = useState<string | null>(null)
    const [dischargeNotes, setDischargeNotes] = useState('')
    const [dischargeReason, setDischargeReason] = useState('completed')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const activePlan = plans.find(p => p.status === 'active')

    const handleGoalToggle = async (planId: string, goalId: string, achieved: boolean) => {
        await updateGoalStatus(planId, goalId, achieved)
        router.refresh()
    }

    const handleDischarge = async (planId: string) => {
        setLoading(true)
        await dischargePlan(planId, {
            discharge_notes: dischargeNotes,
            discharge_reason: dischargeReason,
        })
        setShowDischarge(null)
        setDischargeNotes('')
        setLoading(false)
        router.refresh()
    }

    const handlePause = async (planId: string, isPaused: boolean) => {
        await updateTreatmentPlan(planId, {
            status: isPaused ? 'active' : 'paused',
        })
        router.refresh()
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-emerald-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" />
                        Plan de Tratamiento
                    </h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Nuevo Plan
                    </button>
                </div>

                <div className="divide-y divide-slate-100">
                    {plans.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <ClipboardList className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm">Sin planes de tratamiento</p>
                            <p className="text-xs mt-1">Crea un plan para estructurar el tratamiento del paciente</p>
                        </div>
                    ) : (
                        plans.map(plan => {
                            const isExpanded = expandedPlan === plan.id
                            const statusConfig = STATUS_CONFIG[plan.status] || STATUS_CONFIG.active
                            const progress = plan.total_sessions > 0 ? Math.round((plan.completed_sessions / plan.total_sessions) * 100) : 0
                            const goalsAchieved = (plan.goals as TreatmentPlanGoal[]).filter(g => g.achieved).length
                            const totalGoals = (plan.goals as TreatmentPlanGoal[]).length

                            return (
                                <div key={plan.id} className="group">
                                    {/* Plan Header */}
                                    <button
                                        onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                                        className="w-full p-4 text-left hover:bg-slate-50 transition flex items-center gap-3"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-slate-800 truncate">{plan.title}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>{plan.completed_sessions}/{plan.total_sessions} sesiones</span>
                                                {plan.frequency && <span>{FREQUENCY_LABELS[plan.frequency] || plan.frequency}</span>}
                                                {totalGoals > 0 && <span>{goalsAchieved}/{totalGoals} objetivos</span>}
                                            </div>
                                        </div>

                                        {/* Progress ring */}
                                        <div className="relative w-12 h-12 shrink-0">
                                            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none" stroke="#e5e7eb" strokeWidth="3"
                                                />
                                                <path
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke={plan.status === 'completed' ? '#3b82f6' : '#10b981'}
                                                    strokeWidth="3"
                                                    strokeDasharray={`${progress}, 100`}
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                                                {progress}%
                                            </span>
                                        </div>

                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </button>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4 bg-slate-50/30">
                                            {/* Diagnosis */}
                                            {plan.diagnosis && (
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Diagnóstico</label>
                                                    <p className="text-sm text-slate-700 mt-1">{plan.diagnosis}</p>
                                                </div>
                                            )}

                                            {/* Progress bar */}
                                            <div>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-slate-600 font-medium">Progreso de sesiones</span>
                                                    <span className="text-slate-500">{plan.completed_sessions} de {plan.total_sessions}</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Details grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {plan.start_date && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        Inicio: {new Date(plan.start_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                )}
                                                {plan.estimated_end_date && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        Fin est.: {new Date(plan.estimated_end_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                )}
                                                {plan.package_price && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                                        Paquete: ${Number(plan.package_price).toLocaleString()}
                                                    </div>
                                                )}
                                                {plan.package_price && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                                        Pagado: ${Number(plan.paid_amount).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Goals */}
                                            {totalGoals > 0 && (
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
                                                        Objetivos ({goalsAchieved}/{totalGoals})
                                                    </label>
                                                    <div className="space-y-1.5">
                                                        {(plan.goals as TreatmentPlanGoal[]).map((goal) => (
                                                            <button
                                                                key={goal.id}
                                                                onClick={() => handleGoalToggle(plan.id, goal.id, !goal.achieved)}
                                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition ${
                                                                    goal.achieved ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-700 hover:bg-slate-100'
                                                                }`}
                                                            >
                                                                {goal.achieved
                                                                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                                    : <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                                                                }
                                                                <span className={goal.achieved ? 'line-through' : ''}>{goal.description}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Notes */}
                                            {plan.notes && (
                                                <div>
                                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Notas</label>
                                                    <p className="text-sm text-slate-600 mt-1">{plan.notes}</p>
                                                </div>
                                            )}

                                            {/* Discharge info */}
                                            {plan.status === 'completed' && plan.discharge_reason && (
                                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                                    <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Alta</label>
                                                    <p className="text-sm text-blue-800 mt-1">
                                                        Motivo: {DISCHARGE_REASONS[plan.discharge_reason] || plan.discharge_reason}
                                                    </p>
                                                    {plan.discharge_notes && (
                                                        <p className="text-sm text-blue-700 mt-1">{plan.discharge_notes}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            {(plan.status === 'active' || plan.status === 'paused') && (
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => handlePause(plan.id, plan.status === 'paused')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 border border-amber-200"
                                                    >
                                                        {plan.status === 'paused' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                                        {plan.status === 'paused' ? 'Reanudar' : 'Pausar'}
                                                    </button>
                                                    {plan.status === 'active' && (
                                                        <button
                                                            onClick={() => setShowDischarge(plan.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200"
                                                        >
                                                            <LogOut className="w-3 h-3" />
                                                            Dar de Alta
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Discharge form */}
                                            {showDischarge === plan.id && (
                                                <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-200">
                                                    <h4 className="text-sm font-semibold text-blue-900">Dar de Alta al Paciente</h4>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-700 mb-1">Motivo del alta</label>
                                                        <select
                                                            value={dischargeReason}
                                                            onChange={(e) => setDischargeReason(e.target.value)}
                                                            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                                                        >
                                                            {Object.entries(DISCHARGE_REASONS).map(([key, label]) => (
                                                                <option key={key} value={key}>{label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-700 mb-1">Notas de alta</label>
                                                        <textarea
                                                            value={dischargeNotes}
                                                            onChange={(e) => setDischargeNotes(e.target.value)}
                                                            rows={2}
                                                            placeholder="Resumen de evolución, recomendaciones..."
                                                            className="w-full rounded-lg border border-slate-300 p-2 text-sm resize-none"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setShowDischarge(null)}
                                                            className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDischarge(plan.id)}
                                                            disabled={loading}
                                                            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            {loading ? 'Procesando...' : 'Confirmar Alta'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            <TreatmentPlanModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => router.refresh()}
                patientId={patientId}
            />
        </>
    )
}

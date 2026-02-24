'use client'

import { TrendingDown, TrendingUp, Minus, Activity, Flame, Dumbbell, Move } from 'lucide-react'
import { PatientProgress } from '@/lib/actions/clinical-measurements'

interface ProgressSummaryProps {
    progress: PatientProgress[]
}

const METRIC_CONFIG: Record<string, { label: string, icon: any, unit: string, color: string, invertTrend?: boolean }> = {
    dolor: { label: 'Dolor (EVA)', icon: Flame, unit: '/10', color: 'red', invertTrend: true },
    movilidad: { label: 'Movilidad', icon: Move, unit: '/10', color: 'blue' },
    fuerza: { label: 'Fuerza', icon: Dumbbell, unit: '/10', color: 'green' },
    flexibilidad: { label: 'Flexibilidad', icon: Activity, unit: '/10', color: 'purple' },
    rom: { label: 'ROM', icon: Move, unit: '°', color: 'indigo' },
}

const REGION_LABELS: Record<string, string> = {
    cervical: 'Cervical',
    lumbar: 'Lumbar',
    hombro_derecho: 'Hombro Der.',
    hombro_izquierdo: 'Hombro Izq.',
    rodilla_derecha: 'Rodilla Der.',
    rodilla_izquierda: 'Rodilla Izq.',
    tobillo_derecho: 'Tobillo Der.',
    tobillo_izquierdo: 'Tobillo Izq.',
    cadera_derecha: 'Cadera Der.',
    cadera_izquierda: 'Cadera Izq.',
    codo_derecho: 'Codo Der.',
    codo_izquierdo: 'Codo Izq.',
    muñeca_derecha: 'Muñeca Der.',
    muñeca_izquierda: 'Muñeca Izq.',
}

export default function ProgressSummary({ progress }: ProgressSummaryProps) {
    if (progress.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Evolución del Paciente
                </h3>
                <p className="text-sm text-slate-500">No hay mediciones registradas aún. Registra una medición en la sección de Evolución.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Evolución del Paciente
            </h3>

            <div className="space-y-3">
                {progress.map((p, i) => {
                    const config = METRIC_CONFIG[p.metric] || METRIC_CONFIG.dolor
                    const Icon = config.icon
                    const regionLabel = p.body_region ? REGION_LABELS[p.body_region] || p.body_region : null

                    const isImproving = p.trend === 'improving'
                    const isWorsening = p.trend === 'worsening'

                    // For pain, negative change means improvement
                    const displayChange = config.invertTrend ? -p.changePercent : p.changePercent

                    return (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className={`p-2 rounded-lg bg-${config.color}-100`}>
                                <Icon className={`w-4 h-4 text-${config.color}-600`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-900">
                                        {config.label}
                                    </span>
                                    {regionLabel && (
                                        <span className="text-xs text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                                            {regionLabel}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-500">
                                        {p.firstValue}{config.unit} → {p.lastValue}{config.unit}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        ({p.totalMeasurements} mediciones)
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {isImproving ? (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                        <TrendingDown className="w-3 h-3" />
                                        <span className="text-xs font-bold">
                                            {Math.abs(p.changePercent)}%
                                        </span>
                                    </div>
                                ) : isWorsening ? (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                        <TrendingUp className="w-3 h-3" />
                                        <span className="text-xs font-bold">
                                            {Math.abs(p.changePercent)}%
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                        <Minus className="w-3 h-3" />
                                        <span className="text-xs font-bold">Estable</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

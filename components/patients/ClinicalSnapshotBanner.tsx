'use client'

import { TrendingDown, TrendingUp, Minus, Flame, CalendarDays, Layers } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PatientProgress } from '@/lib/actions/clinical-measurements'

interface ClinicalSnapshotBannerProps {
    progress: PatientProgress[]
    sessionsCount: number
    lastSessionDate: string | null
}

function getOverallStatus(progress: PatientProgress[]) {
    if (progress.length === 0) return null
    const improving = progress.filter(p => p.trend === 'improving').length
    const worsening = progress.filter(p => p.trend === 'worsening').length
    if (improving > worsening) return 'improving'
    if (worsening > improving) return 'worsening'
    return 'stable'
}

const STATUS_CONFIG = {
    improving: {
        label: 'Mejorando',
        icon: TrendingDown,
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
        iconColor: 'text-emerald-600',
    },
    stable: {
        label: 'Estable',
        icon: Minus,
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        iconColor: 'text-amber-600',
    },
    worsening: {
        label: 'Atención',
        icon: TrendingUp,
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        dot: 'bg-red-500',
        iconColor: 'text-red-600',
    },
}

export default function ClinicalSnapshotBanner({
    progress,
    sessionsCount,
    lastSessionDate,
}: ClinicalSnapshotBannerProps) {
    const overallStatus = getOverallStatus(progress)
    const painMetric = progress.find(p => p.metric === 'dolor')
    const lastSeen = lastSessionDate
        ? formatDistanceToNow(new Date(lastSessionDate), { addSuffix: true, locale: es })
        : null

    if (!overallStatus && sessionsCount === 0) return null

    const statusCfg = overallStatus ? STATUS_CONFIG[overallStatus] : null
    const StatusIcon = statusCfg?.icon

    return (
        <div className="flex flex-wrap gap-3">
            {/* Overall clinical status */}
            {statusCfg && StatusIcon && (
                <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                    <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                    <StatusIcon className={`h-4 w-4 ${statusCfg.iconColor}`} />
                    {statusCfg.label}
                </div>
            )}

            {/* Last EVA score */}
            {painMetric && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">EVA</span>
                    <span className="text-slate-400">{painMetric.firstValue} → </span>
                    <span className={`font-bold ${painMetric.lastValue <= 3 ? 'text-emerald-600' : painMetric.lastValue <= 6 ? 'text-amber-600' : 'text-red-600'}`}>
                        {painMetric.lastValue}/10
                    </span>
                </div>
            )}

            {/* Sessions count */}
            {sessionsCount > 0 && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{sessionsCount}</span>
                    <span className="text-slate-500">{sessionsCount === 1 ? 'sesión' : 'sesiones'}</span>
                </div>
            )}

            {/* Last visit */}
            {lastSeen && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-600">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <span>Última visita {lastSeen}</span>
                </div>
            )}
        </div>
    )
}

import Link from 'next/link'
import { AlertTriangle, DollarSign, UserX, CheckCircle2, TrendingUp } from 'lucide-react'

interface Props {
    pendingAmount: number
    pendingPlansCount: number
    inactivePatients: number
    completionRate: number
    scheduledThisMonth: number
}

export default function BusinessAlertsPanel({
    pendingAmount,
    pendingPlansCount,
    inactivePatients,
    completionRate,
    scheduledThisMonth,
}: Props) {
    const hasAlerts = pendingAmount > 0 || inactivePatients > 0

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                    <h2 className="text-sm font-semibold text-slate-700">Salud del negocio</h2>
                </div>
                {hasAlerts && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                        <AlertTriangle className="h-3 w-3" />
                        Requiere atención
                    </span>
                )}
            </div>

            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {/* Cobros pendientes */}
                <Link
                    href="/dashboard/finance?tab=pending"
                    className="flex items-start gap-3 p-5 hover:bg-slate-50 transition-colors group"
                >
                    <div className={`p-2 rounded-lg ${pendingAmount > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                        <DollarSign className={`h-4 w-4 ${pendingAmount > 0 ? 'text-red-500' : 'text-green-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Cobros pendientes</p>
                        {pendingAmount > 0 ? (
                            <>
                                <p className="text-xl font-bold text-slate-900">
                                    ${pendingAmount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    en {pendingPlansCount} plan{pendingPlansCount !== 1 ? 'es' : ''} activo{pendingPlansCount !== 1 ? 's' : ''}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-xl font-bold text-green-600">$0</p>
                                <p className="text-xs text-slate-500 mt-0.5">Todo al corriente</p>
                            </>
                        )}
                    </div>
                    <span className="text-slate-300 group-hover:text-slate-500 text-lg leading-none mt-1">›</span>
                </Link>

                {/* Pacientes inactivos */}
                <Link
                    href="/dashboard/patients?filter=inactive"
                    className="flex items-start gap-3 p-5 hover:bg-slate-50 transition-colors group"
                >
                    <div className={`p-2 rounded-lg ${inactivePatients > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                        <UserX className={`h-4 w-4 ${inactivePatients > 0 ? 'text-amber-500' : 'text-green-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Pacientes inactivos</p>
                        {inactivePatients > 0 ? (
                            <>
                                <p className="text-xl font-bold text-slate-900">{inactivePatients}</p>
                                <p className="text-xs text-slate-500 mt-0.5">sin visita en 30+ días</p>
                            </>
                        ) : (
                            <>
                                <p className="text-xl font-bold text-green-600">0</p>
                                <p className="text-xs text-slate-500 mt-0.5">Todos activos</p>
                            </>
                        )}
                    </div>
                    <span className="text-slate-300 group-hover:text-slate-500 text-lg leading-none mt-1">›</span>
                </Link>

                {/* Tasa de asistencia */}
                <div className="flex items-start gap-3 p-5">
                    <div className={`p-2 rounded-lg ${
                        completionRate >= 80 ? 'bg-green-50' :
                        completionRate >= 60 ? 'bg-amber-50' : 'bg-red-50'
                    }`}>
                        <CheckCircle2 className={`h-4 w-4 ${
                            completionRate >= 80 ? 'text-green-500' :
                            completionRate >= 60 ? 'text-amber-500' : 'text-red-500'
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Tasa de asistencia</p>
                        <p className={`text-xl font-bold ${
                            completionRate >= 80 ? 'text-green-600' :
                            completionRate >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                            {scheduledThisMonth === 0 ? '—' : `${completionRate}%`}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {scheduledThisMonth === 0 ? 'Sin citas este mes' : `de ${scheduledThisMonth} citas programadas`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

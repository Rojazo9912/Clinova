import Link from 'next/link'

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
        <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    📊 Salud del negocio
                </h2>
                {hasAlerts && (
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-3 py-1 rounded-full">
                        ⚠️ ¡Cuidemos estos temas!
                    </span>
                )}
            </div>

            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">

                {/* Cobros pendientes */}
                <Link
                    href="/dashboard/finance?tab=pending"
                    className="flex items-center gap-4 p-5 hover:bg-orange-50/60 dark:hover:bg-orange-900/10 transition-colors group"
                >
                    <div className={`text-3xl select-none ${pendingAmount > 0 ? '' : 'grayscale'}`}>
                        💵
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Cobros pendientes</p>
                        <p className={`text-2xl font-extrabold leading-none ${pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${pendingAmount > 0 ? pendingAmount.toLocaleString('es-MX', { minimumFractionDigits: 0 }) : '0'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {pendingAmount > 0
                                ? `en ${pendingPlansCount} plan${pendingPlansCount !== 1 ? 'es' : ''} activo${pendingPlansCount !== 1 ? 's' : ''}`
                                : 'Todo al corriente ✓'}
                        </p>
                    </div>
                    <span className="text-muted-foreground/60 group-hover:text-muted-foreground text-xl">›</span>
                </Link>

                {/* Pacientes inactivos */}
                <Link
                    href="/dashboard/patients?filter=inactive"
                    className="flex items-center gap-4 p-5 hover:bg-amber-50/60 dark:hover:bg-amber-900/10 transition-colors group"
                >
                    <div className={`text-3xl select-none ${inactivePatients === 0 ? 'grayscale' : ''}`}>
                        🙋
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Pacientes inactivos</p>
                        <p className={`text-2xl font-extrabold leading-none ${inactivePatients > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                            {inactivePatients}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {inactivePatients > 0 ? 'sin visita en 30+ días' : 'Todos activos ✓'}
                        </p>
                    </div>
                    <span className="text-muted-foreground/60 group-hover:text-muted-foreground text-xl">›</span>
                </Link>

                {/* Tasa de asistencia */}
                <div className="flex items-center gap-4 p-5">
                    <div className="text-3xl select-none">
                        🎯
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Tasa de asistencia</p>
                        <p className={`text-2xl font-extrabold leading-none ${
                            completionRate >= 80 ? 'text-green-600' :
                            completionRate >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                            {scheduledThisMonth === 0 ? '—' : `${completionRate}%`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {scheduledThisMonth === 0 ? 'Sin citas este mes' : `de ${scheduledThisMonth} citas programadas`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

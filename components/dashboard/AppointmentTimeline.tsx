'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'

interface Appointment {
    id: string
    patient_id: string | null
    patient_name: string
    service_name: string
    start_time: string
    status: string
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
    confirmed:  { label: 'Confirmada',  classes: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700' },
    pending:    { label: 'Pendiente',   classes: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700' },
    cancelled:  { label: 'Cancelada',  classes: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700' },
    completed:  { label: 'Completada', classes: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600' },
}

const AVATAR_COLORS = [
    'from-blue-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-orange-400 to-rose-500',
    'from-cyan-400 to-sky-500',
    'from-pink-400 to-fuchsia-500',
]

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

function isHappeningNow(startTime: string) {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    return now >= start && now <= end
}

function isPast(startTime: string) {
    const end = new Date(new Date(startTime).getTime() + 60 * 60 * 1000)
    return new Date() > end
}

export default function AppointmentTimeline({ appointments }: { appointments: Appointment[] }) {
    const confirmedCount = appointments.filter(a => a.status === 'confirmed').length

    return (
        <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        🗓️ Pacientes de hoy
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {appointments.length === 0
                            ? 'Sin citas programadas'
                            : `${appointments.length} citas · ${confirmedCount} confirmadas`}
                    </p>
                </div>
                <Link
                    href="/dashboard/agenda"
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold transition-colors"
                >
                    Ver agenda <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {/* List */}
            <div className="divide-y divide-border">
                {appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                        <div className="text-5xl mb-4 select-none">🌿</div>
                        <p className="font-bold text-foreground text-base">¡Día tranquilo!</p>
                        <p className="text-sm text-slate-400 mt-1 max-w-xs">
                            Tu pasión mueve vidas. Cada día es una oportunidad.
                        </p>
                        <Link
                            href="/dashboard/agenda"
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                            Agendar cita
                        </Link>
                    </div>
                ) : (
                    appointments.map((apt, idx) => {
                        const happening = isHappeningNow(apt.start_time)
                        const past = !happening && isPast(apt.start_time)
                        const status = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.pending
                        const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                        const href = apt.patient_id
                            ? `/dashboard/patients/${apt.patient_id}`
                            : '/dashboard/patients'

                        return (
                            <Link
                                key={apt.id}
                                href={href}
                                className={`flex items-center gap-4 px-6 py-4 transition-colors group relative ${
                                    happening
                                        ? 'bg-blue-50/70 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                                        : past
                                        ? 'opacity-55 hover:opacity-75 hover:bg-muted'
                                        : 'hover:bg-muted'
                                }`}
                            >
                                {/* Happening now accent */}
                                {happening && (
                                    <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-500 rounded-r-full" />
                                )}

                                {/* Time */}
                                <div className="w-12 flex-shrink-0 text-center">
                                    <span className={`text-sm font-bold tabular-nums ${
                                        happening ? 'text-blue-600 dark:text-blue-400' : past ? 'text-muted-foreground' : 'text-foreground'
                                    }`}>
                                        {format(new Date(apt.start_time), 'HH:mm')}
                                    </span>
                                    {happening && (
                                        <div className="flex items-center justify-center gap-1 mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">Ahora</span>
                                        </div>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <span className="text-xs font-bold text-white">{getInitials(apt.patient_name)}</span>
                                </div>

                                {/* Patient info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${past ? 'text-muted-foreground' : 'text-foreground'}`}>
                                        {apt.patient_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">{apt.service_name}</p>
                                </div>

                                {/* Status + chevron */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`hidden sm:inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${status.classes}`}>
                                        {status.label}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}

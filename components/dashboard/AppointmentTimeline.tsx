'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, ChevronRight } from 'lucide-react'

interface Appointment {
    id: string
    patient_id: string | null
    patient_name: string
    service_name: string
    start_time: string
    status: string
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
    confirmed:  { label: 'Confirmada',  classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    pending:    { label: 'Pendiente',   classes: 'bg-amber-100 text-amber-700 border-amber-200' },
    cancelled:  { label: 'Cancelada',  classes: 'bg-red-100 text-red-600 border-red-200' },
    completed:  { label: 'Completada', classes: 'bg-slate-100 text-slate-500 border-slate-200' },
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
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h3 className="text-base font-semibold text-slate-900">Pacientes de hoy</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {appointments.length === 0
                            ? 'Sin citas programadas'
                            : `${appointments.length} citas · ${confirmedCount} confirmadas`}
                    </p>
                </div>
                <Link
                    href="/dashboard/agenda"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors"
                >
                    Ver agenda <ChevronRight className="h-4 w-4" />
                </Link>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-50">
                {appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <Calendar className="h-7 w-7 text-slate-400" />
                        </div>
                        <p className="font-semibold text-slate-700">Día libre</p>
                        <p className="text-sm text-slate-400 mt-1">No tienes citas programadas para hoy</p>
                        <Link href="/dashboard/agenda" className="mt-4 text-sm text-blue-600 hover:underline">
                            Ir a la agenda →
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
                                        ? 'bg-blue-50/70 hover:bg-blue-50'
                                        : past
                                        ? 'opacity-55 hover:opacity-75 hover:bg-slate-50'
                                        : 'hover:bg-slate-50'
                                }`}
                            >
                                {/* Happening now accent */}
                                {happening && (
                                    <div className="absolute left-0 top-0 h-full w-0.5 bg-blue-500 rounded-r-full" />
                                )}

                                {/* Time */}
                                <div className="w-12 flex-shrink-0 text-center">
                                    <span className={`text-sm font-bold tabular-nums ${
                                        happening ? 'text-blue-600' : past ? 'text-slate-400' : 'text-slate-700'
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
                                    <p className={`text-sm font-semibold truncate ${past ? 'text-slate-500' : 'text-slate-900'}`}>
                                        {apt.patient_name}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{apt.service_name}</p>
                                </div>

                                {/* Status + chevron */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`hidden sm:inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${status.classes}`}>
                                        {status.label}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}

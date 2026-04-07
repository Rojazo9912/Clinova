'use client'

import { useEffect, useState } from 'react'
import { getPatientAppointments } from '@/lib/actions/portal'
import { Bell, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { format, formatDistanceToNow, parseISO, isFuture, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

interface Notification {
    id: string
    type: 'reminder' | 'confirmed' | 'cancelled' | 'completed' | 'upcoming'
    title: string
    description: string
    date: string
    read: boolean
}

function buildNotifications(appointments: any[]): Notification[] {
    const notifs: Notification[] = []
    const now = new Date()

    for (const apt of appointments) {
        const aptDate = new Date(apt.start_time)
        const serviceName = apt.service?.name || 'Cita'
        const physioName = apt.physiotherapist?.full_name || 'Fisioterapeuta'

        if (apt.status === 'cancelled') {
            notifs.push({
                id: `cancel-${apt.id}`,
                type: 'cancelled',
                title: 'Cita cancelada',
                description: `${serviceName} con ${physioName}`,
                date: apt.start_time,
                read: true
            })
        } else if (apt.status === 'completed') {
            notifs.push({
                id: `done-${apt.id}`,
                type: 'completed',
                title: 'Sesión completada',
                description: `${serviceName} con ${physioName}`,
                date: apt.start_time,
                read: true
            })
        } else if (isFuture(aptDate)) {
            const diffMs = aptDate.getTime() - now.getTime()
            const diffHours = diffMs / (1000 * 60 * 60)

            if (diffHours <= 48) {
                notifs.push({
                    id: `remind-${apt.id}`,
                    type: 'reminder',
                    title: 'Recordatorio de cita',
                    description: `${serviceName} el ${format(aptDate, "d 'de' MMMM 'a las' HH:mm", { locale: es })}`,
                    date: apt.start_time,
                    read: false
                })
            } else {
                notifs.push({
                    id: `upcoming-${apt.id}`,
                    type: 'upcoming',
                    title: 'Cita próxima',
                    description: `${serviceName} con ${physioName} el ${format(aptDate, "d 'de' MMMM", { locale: es })}`,
                    date: apt.start_time,
                    read: true
                })
            }
        } else if (apt.status === 'confirmed') {
            notifs.push({
                id: `conf-${apt.id}`,
                type: 'confirmed',
                title: 'Cita confirmada',
                description: `${serviceName} con ${physioName}`,
                date: apt.start_time,
                read: true
            })
        }
    }

    return notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const TYPE_CONFIG = {
    reminder: { icon: Bell, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600', label: 'Recordatorio' },
    confirmed: { icon: CheckCircle2, bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600', label: 'Confirmada' },
    cancelled: { icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-500', label: 'Cancelada' },
    completed: { icon: CheckCircle2, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600', label: 'Completada' },
    upcoming: { icon: Calendar, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600', label: 'Próxima' },
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [readIds, setReadIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        async function load() {
            setLoading(true)
            const apts = await getPatientAppointments()
            setNotifications(buildNotifications(apts))
            setLoading(false)
        }
        load()
    }, [])

    function markAllRead() {
        setReadIds(new Set(notifications.map(n => n.id)))
    }

    const unreadCount = notifications.filter(n => !n.read && !readIds.has(n.id)).length

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-56" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        Notificaciones
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="text-muted-foreground mt-1">Actividad de tus citas y recordatorios</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                    >
                        Marcar todo como leído
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-border">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <p className="text-muted-foreground">No tienes notificaciones aún</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(notif => {
                        const cfg = TYPE_CONFIG[notif.type]
                        const Icon = cfg.icon
                        const isRead = notif.read || readIds.has(notif.id)

                        return (
                            <div
                                key={notif.id}
                                onClick={() => setReadIds(prev => new Set([...prev, notif.id]))}
                                className={`flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer ${
                                    isRead
                                        ? 'bg-card border-border opacity-80'
                                        : 'bg-card border-blue-200 dark:border-blue-900/50 shadow-sm'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm text-foreground">{notif.title}</p>
                                        {!isRead && (
                                            <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">{notif.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(parseISO(notif.date), { addSuffix: true, locale: es })}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                                    {cfg.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { getPatientAppointments, getPatientActivePlan } from '@/lib/actions/portal'
import Link from 'next/link'
import { Calendar, Clock, ChevronRight, AlertCircle, TrendingUp, CheckCircle2, DollarSign, Plus, Activity } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

interface Appointment {
    id: string
    start_time: string
    end_time: string
    status: string
    service: {
        name: string
    }
    physiotherapist: {
        full_name: string
    }
}

export default function PortalDashboardPage() {
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
    const [activePlan, setActivePlan] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            try {
                const appointments = await getPatientAppointments()
                setUpcomingAppointments(appointments)

                const plan = await getPatientActivePlan()
                setActivePlan(plan)
            } catch (error) {
                console.error("Failed to load dashboard data:", error)
                // Optionally, set an error state here
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            case 'completed': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmada'
            case 'pending': return 'Pendiente'
            case 'cancelled': return 'Cancelada'
            case 'completed': return 'Completada'
            default: return status
        }
    }

    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-64 w-full rounded-3xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Bienvenido</h1>
                <p className="text-muted-foreground mt-2">Gestiona tus citas y revisa tu información médica</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    href="/portal/appointments/new"
                    className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition">
                            <Plus className="w-6 h-6 text-blue-600 group-hover:text-white transition" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Agendar Cita</h3>
                            <p className="text-sm text-muted-foreground">Nueva cita</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/portal/appointments"
                    className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Mis Citas</h3>
                            <p className="text-sm text-muted-foreground">Ver todas</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/portal/medical-records"
                    className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Progreso</h3>
                            <p className="text-sm text-muted-foreground">Ver historial</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/portal/exercises"
                    className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Ejercicios</h3>
                            <p className="text-sm text-muted-foreground">Ver asignados</p>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments */}
                <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 h-fit">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-foreground">Próximas Citas</h2>
                        <Link href="/portal/appointments" className="text-sm text-blue-600 hover:text-blue-700">
                            Ver todas →
                        </Link>
                    </div>

                    {upcomingAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No tienes citas próximas</p>
                            <Link
                                href="/portal/appointments/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Agendar Cita
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingAppointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{appointment.service.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(appointment.start_time), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Con {appointment.physiotherapist.full_name}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                        {getStatusText(appointment.status)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Plan Sidebar */}
                <div className="space-y-6">
                    {activePlan ? (
                        <div className="bg-card rounded-xl border border-border p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Tu Plan</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-sm">{activePlan.title}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {activePlan.completed_sessions} / {activePlan.total_sessions}
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all" 
                                            style={{ width: `${Math.min(100, (activePlan.completed_sessions / activePlan.total_sessions) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="pt-2">
                                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Diagnóstico</p>
                                    <p className="text-sm font-medium">{activePlan.diagnosis || 'En progreso'}</p>
                                </div>

                                {activePlan.package_price > (activePlan.paid_amount || 0) && (
                                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                        <p className="text-xs text-orange-600 dark:text-orange-400 uppercase font-bold mb-1">Saldo Pendiente</p>
                                        <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                                            ${activePlan.package_price - (activePlan.paid_amount || 0)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : !loading && (
                        <div className="bg-muted/50 rounded-xl border border-dashed border-border p-6 text-center">
                            <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-muted-foreground">No tienes un plan de tratamiento activo en este momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

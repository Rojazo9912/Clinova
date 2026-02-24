'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Appointment {
    id: string
    start_time: string
    end_time: string
    status: string
    service: {
        name: string
    }
    physiotherapist: {
        first_name: string
        last_name: string
    }
}

export default function PortalDashboardPage() {
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function loadAppointments() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get patient ID
            const { data: patientUser } = await supabase
                .from('patient_users')
                .select('patient_id')
                .eq('user_id', user.id)
                .single()

            if (!patientUser) return

            // Get upcoming appointments
            const { data } = await supabase
                .from('appointments')
                .select(`
                    id,
                    start_time,
                    end_time,
                    status,
                    services!inner(name),
                    profiles!inner(first_name, last_name)
                `)
                .eq('patient_id', patientUser.patient_id)
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true })
                .limit(5)

            // Transform data to match interface
            const appointments = (data || []).map((apt: any) => ({
                id: apt.id,
                start_time: apt.start_time,
                end_time: apt.end_time,
                status: apt.status,
                service: apt.services,
                physiotherapist: apt.profiles
            }))

            setUpcomingAppointments(appointments)
            setLoading(false)
        }

        loadAppointments()
    }, [supabase])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
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

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Bienvenido</h1>
                <p className="text-slate-600 mt-2">Gestiona tus citas y revisa tu información médica</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    href="/portal/appointments/new"
                    className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition">
                            <Plus className="w-6 h-6 text-blue-600 group-hover:text-white transition" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Agendar Cita</h3>
                            <p className="text-sm text-slate-600">Nueva cita</p>
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
                            <h3 className="font-semibold text-slate-900">Mis Citas</h3>
                            <p className="text-sm text-slate-600">Ver todas</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/portal/medical-records"
                    className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Expediente</h3>
                            <p className="text-sm text-slate-600">Ver historial</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/portal/exercises"
                    className="p-6 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Ejercicios</h3>
                            <p className="text-sm text-slate-600">Ver asignados</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Próximas Citas</h2>
                    <Link href="/portal/appointments" className="text-sm text-blue-600 hover:text-blue-700">
                        Ver todas →
                    </Link>
                </div>

                {loading ? (
                    <p className="text-center py-8 text-slate-500">Cargando...</p>
                ) : upcomingAppointments.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 mb-4">No tienes citas próximas</p>
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
                                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{appointment.service.name}</h3>
                                        <p className="text-sm text-slate-600">
                                            {format(new Date(appointment.start_time), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            Con {appointment.physiotherapist.first_name} {appointment.physiotherapist.last_name}
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
        </div>
    )
}

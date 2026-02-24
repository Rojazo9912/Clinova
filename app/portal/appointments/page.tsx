'use client'

import { useEffect, useState } from 'react'
import { getPatientAppointments, cancelAppointment } from '@/lib/actions/portal'
import { Calendar, Clock, User, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Appointment {
    id: string
    start_time: string
    end_time: string
    status: string
    notes: string | null
    service: { name: string }
    physiotherapist: { first_name: string; last_name: string }
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')

    useEffect(() => {
        loadAppointments()
    }, [])

    async function loadAppointments() {
        setLoading(true)
        const data = await getPatientAppointments()
        setAppointments(data as Appointment[])
        setLoading(false)
    }

    async function handleCancel(id: string) {
        if (!confirm('¿Estás seguro de cancelar esta cita?')) return

        const result = await cancelAppointment(id)
        if (result.success) {
            loadAppointments()
        } else {
            alert(result.message)
        }
    }

    const filteredAppointments = appointments.filter(apt => {
        const isPast = new Date(apt.start_time) < new Date()
        if (filter === 'upcoming') return !isPast && apt.status !== 'cancelled'
        if (filter === 'past') return isPast || apt.status === 'cancelled' || apt.status === 'completed'
        return true
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            case 'completed': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusText = (status: string) => {
        const map: any = {
            confirmed: 'Confirmada',
            pending: 'Pendiente',
            cancelled: 'Cancelada',
            completed: 'Completada'
        }
        return map[status] || status
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mis Citas</h1>
                    <p className="text-slate-600 mt-2">Gestiona tus citas médicas</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('upcoming')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'upcoming'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Próximas
                </button>
                <button
                    onClick={() => setFilter('past')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'past'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Pasadas
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    Todas
                </button>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Cargando...</p>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">No hay citas en esta categoría</p>
                    </div>
                ) : (
                    filteredAppointments.map((apt) => (
                        <div key={apt.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-slate-900">{apt.service.name}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {format(new Date(apt.start_time), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {apt.physiotherapist.first_name} {apt.physiotherapist.last_name}
                                            </div>
                                        </div>
                                        {apt.notes && (
                                            <p className="mt-2 text-sm text-slate-600">{apt.notes}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                                        {getStatusText(apt.status)}
                                    </span>
                                    {apt.status !== 'cancelled' && apt.status !== 'completed' && new Date(apt.start_time) > new Date() && (
                                        <button
                                            onClick={() => handleCancel(apt.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Cancelar cita"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

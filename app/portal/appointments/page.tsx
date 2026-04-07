'use client'

import { useEffect, useState } from 'react'
import { getPatientAppointments, cancelAppointment, rescheduleAppointment, getAvailableSlots } from '@/lib/actions/portal'
import { Calendar, Clock, User, X, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import Link from 'next/link'

interface Appointment {
    id: string
    start_time: string
    end_time: string
    status: string
    notes: string | null
    service: { name: string }
    physiotherapist: { full_name: string }
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')

    // Reschedule state
    const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null)
    const [rescheduleDate, setRescheduleDate] = useState('')
    const [slots, setSlots] = useState<string[]>([])
    const [selectedSlot, setSelectedSlot] = useState('')
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => { loadAppointments() }, [])

    async function loadAppointments() {
        setLoading(true)
        const data = await getPatientAppointments()
        setAppointments(data as Appointment[])
        setLoading(false)
    }

    async function handleCancel(id: string) {
        if (!confirm('¿Estás seguro de cancelar esta cita?')) return
        const result = await cancelAppointment(id)
        if (result.success) { toast.success(result.message); loadAppointments() }
        else toast.error(result.message)
    }

    async function handleRescheduleOpen(apt: Appointment) {
        setRescheduleApt(apt)
        setRescheduleDate('')
        setSlots([])
        setSelectedSlot('')
    }

    async function handleDateChange(date: string) {
        setRescheduleDate(date)
        setSelectedSlot('')
        if (!rescheduleApt || !date) return
        setLoadingSlots(true)
        // Get serviceId from current appointment — we pass via hidden lookup
        const apts = await getPatientAppointments()
        const fullApt = (apts as any[]).find(a => a.id === rescheduleApt.id)
        const data = await getAvailableSlots(date, fullApt?.service_id || '')
        setSlots(data)
        setLoadingSlots(false)
    }

    async function handleRescheduleSubmit() {
        if (!rescheduleApt || !rescheduleDate || !selectedSlot) return
        setSubmitting(true)
        const result = await rescheduleAppointment(rescheduleApt.id, rescheduleDate, selectedSlot)
        setSubmitting(false)
        if (result.success) {
            toast.success(result.message)
            setRescheduleApt(null)
            loadAppointments()
        } else {
            toast.error(result.message)
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
            case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'pending': case 'scheduled': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            case 'completed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusText = (status: string) => {
        const map: any = { confirmed: 'Confirmada', pending: 'Pendiente', scheduled: 'Agendada', cancelled: 'Cancelada', completed: 'Completada' }
        return map[status] || status
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const canModify = (apt: Appointment) =>
        apt.status !== 'cancelled' && apt.status !== 'completed' && new Date(apt.start_time) > new Date()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Mis Citas</h1>
                    <p className="text-muted-foreground mt-2">Gestiona tus citas médicas</p>
                </div>
                <Link
                    href="/portal/appointments/new"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                >
                    + Nueva Cita
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {(['upcoming', 'past', 'all'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-card text-foreground hover:bg-muted border border-border'}`}
                    >
                        {{ upcoming: 'Próximas', past: 'Pasadas', all: 'Todas' }[f]}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12"><p className="text-muted-foreground">Cargando...</p></div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No hay citas en esta categoría</p>
                    </div>
                ) : (
                    filteredAppointments.map((apt) => (
                        <div key={apt.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-foreground">{apt.service.name}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {format(new Date(apt.start_time), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {apt.physiotherapist.full_name}
                                            </div>
                                        </div>
                                        {apt.notes && <p className="mt-2 text-sm text-muted-foreground">{apt.notes}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                                        {getStatusText(apt.status)}
                                    </span>
                                    {canModify(apt) && (
                                        <>
                                            <button
                                                onClick={() => handleRescheduleOpen(apt)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                title="Reagendar cita"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCancel(apt.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                title="Cancelar cita"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Reschedule Modal */}
            {rescheduleApt && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Reagendar Cita</h2>
                                <p className="text-sm text-muted-foreground">{rescheduleApt.service.name}</p>
                            </div>
                            <button onClick={() => setRescheduleApt(null)} className="p-2 hover:bg-muted rounded-lg transition">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Date picker */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">Nueva Fecha</label>
                                <input
                                    type="date"
                                    min={todayStr}
                                    value={rescheduleDate}
                                    onChange={e => handleDateChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            {/* Slots */}
                            {rescheduleDate && (
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">Horario disponible</label>
                                    {loadingSlots ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <p className="text-sm text-muted-foreground py-3 text-center">No hay horarios disponibles para este día.</p>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                            {slots.map(slot => (
                                                <button
                                                    key={slot}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`py-2 text-sm rounded-lg font-medium transition ${
                                                        selectedSlot === slot
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-muted hover:bg-blue-50 dark:hover:bg-blue-900/20 text-foreground border border-border'
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={() => setRescheduleApt(null)}
                                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition text-foreground"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRescheduleSubmit}
                                disabled={!selectedSlot || submitting}
                                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import AdvancedCalendar from '@/components/calendar/AdvancedCalendar'
import AvailabilityBlockModal from '@/components/calendar/AvailabilityBlockModal'
import RecurringAppointmentModal from '@/components/calendar/RecurringAppointmentModal'
import { getAppointmentsForCalendar, updateAppointmentTime, createQuickAppointment, getPatientsForCalendar, getServicesForCalendar, getGoogleCalendarBlocks } from '@/lib/actions/appointments-calendar'
import { getAvailabilityBlocks, checkTimeSlotAvailability } from '@/lib/actions/availability'
import { SlotInfo } from 'react-big-calendar'
import { X, Plus, Calendar as CalendarIcon, User, Clock, Ban, Repeat, Send } from 'lucide-react'
import { resendAppointmentConfirmation } from '@/lib/actions/notifications'
import SlideOver from '@/components/ui/SlideOver'
import { toast } from 'sonner'

interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    resource?: {
        patientId: string
        patientName: string
        serviceId: string
        serviceName: string
        status: string
        isBlock?: boolean
        isGcal?: boolean
    }
}

export default function AgendaPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [patients, setPatients] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Block Mode State
    const [isBlockMode, setIsBlockMode] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        patientId: '',
        serviceId: '',
        notes: ''
    })

    // Load initial data
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        // Get date range for current view (1 month)
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0)

        const [appointmentsData, patientsData, servicesData, blocksData, gcalBlocks] = await Promise.all([
            getAppointmentsForCalendar(),
            getPatientsForCalendar(),
            getServicesForCalendar(),
            getAvailabilityBlocks(startDate, endDate),
            getGoogleCalendarBlocks(startDate, endDate)
        ])

        // Convert blocks to calendar events
        const blockEvents = blocksData.map((block: any) => ({
            id: `block-${block.id}`,
            title: `🚫 ${block.reason || 'Bloqueado'}`,
            start: new Date(block.start_time),
            end: new Date(block.end_time),
            resource: {
                patientId: '',
                patientName: '',
                serviceId: '',
                serviceName: '',
                status: 'blocked',
                isBlock: true,
                blockId: block.id
            }
        }))

        setEvents([...appointmentsData, ...blockEvents, ...gcalBlocks])
        setPatients(patientsData)
        setServices(servicesData)

    }

    // Handle event drop (drag & drop)
    const handleEventDrop = useCallback(async (eventId: string, start: Date, end: Date) => {
        // Prevent moving GCal blocks or normal blocks
        if (eventId.toString().startsWith('block-') || eventId.toString().startsWith('gcal-')) {
            toast.warning('No puedes mover bloqueos de calendario.')
            return
        }

        setLoading(true)
        try {
            await updateAppointmentTime(eventId, start, end)
            await loadData()
        } catch (error) {
            console.error('Error updating appointment:', error)
            toast.error('Error al reagendar la cita')
        } finally {
            setLoading(false)
        }
    }, [])

    // Handle event resize
    const handleEventResize = useCallback(async (eventId: string, start: Date, end: Date) => {
        if (eventId.toString().startsWith('block-') || eventId.toString().startsWith('gcal-')) {
            toast.warning('No puedes redimensionar bloqueos de calendario.')
            return
        }

        setLoading(true)
        try {
            await updateAppointmentTime(eventId, start, end)
            await loadData()
        } catch (error) {
            console.error('Error resizing appointment:', error)
            toast.error('Error al cambiar la duración')
        } finally {
            setLoading(false)
        }
    }, [])

    // Handle slot selection (create new appointment OR block)
    const handleSelectSlot = useCallback(async (slotInfo: SlotInfo) => {
        setSelectedSlot(slotInfo)

        // If in Block Mode, open Block Modal immediately
        if (isBlockMode) {
            setIsBlockModalOpen(true)
            return
        }

        // Si hay eventos de Google Calendar en ese horario, también bloqueamos
        const isGcalConflict = events.some(e =>
            e.resource?.isGcal &&
            (slotInfo.start < new Date(e.end) && slotInfo.end > new Date(e.start))
        )

        if (isGcalConflict) {
            toast.warning('Este horario se cruza con un evento de Google Calendar.')
            return
        }

        // Check if slot is available (only for appointments)
        const availability = await checkTimeSlotAvailability(slotInfo.start, slotInfo.end)

        if (!availability.available) {
            toast.error(`Horario bloqueado: ${availability.conflictingBlock?.reason || 'No disponible'}`)
            return
        }

        setSelectedEvent(null)
        setFormData({ patientId: '', serviceId: '', notes: '' })
        setIsModalOpen(true)
    }, [isBlockMode])

    const handleResendConfirmation = async () => {
        if (!selectedEvent?.id) return

        const confirmed = confirm('¿Enviar confirmación de cita por WhatsApp y Email?')
        if (!confirmed) return

        try {
            const result = await resendAppointmentConfirmation(selectedEvent.id)
            if (result.success) {
                toast.success('Confirmación enviada exitosamente')
            } else {
                toast.error(result.error || 'Error al enviar confirmación')
            }
        } catch (error) {
            console.error('Error resending confirmation:', error)
            toast.error('Error al enviar confirmación')
        }
    }

    // Handle event selection (view/edit appointment)
    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        if (event.resource?.isBlock) {
            // Optional: Handle block selection (e.g., delete block)
            // For now, prevent opening appointment modal for blocks
            return
        }

        setSelectedEvent(event)
        setSelectedSlot(null)
        setFormData({
            patientId: event.resource?.patientId || '',
            serviceId: event.resource?.serviceId || '',
            notes: ''
        })
        setIsModalOpen(true)
    }, [])

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSlot) return

        setLoading(true)
        try {
            await createQuickAppointment({
                patientId: formData.patientId,
                serviceId: formData.serviceId,
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
                notes: formData.notes
            })
            await loadData()
            setIsModalOpen(false)
            toast.success('Cita creada exitosamente')
        } catch (error) {
            console.error('Error creating appointment:', error)
            toast.error('Error al crear la cita')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
                    <p className="text-muted-foreground">
                        Gestiona las citas de tu clínica
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsRecurringModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Repeat className="h-4 w-4" />
                        Citas Recurrentes
                    </button>

                    <button
                        onClick={() => setIsBlockMode(!isBlockMode)}
                        className={`px-4 py-2 rounded-lg transition flex items-center gap-2 border ${isBlockMode
                            ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Ban className={`h-4 w-4 ${isBlockMode ? 'text-red-600' : 'text-gray-500'}`} />
                        {isBlockMode ? 'Modo Bloqueo Activado' : 'Bloquear Horario'}
                    </button>
                </div>
            </div>

            {/* Block Mode Banner */}
            {isBlockMode && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div>
                        <p className="text-sm font-medium text-red-800">
                            Modo Bloqueo Activado
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                            Arrastra en el calendario para bloquear horarios. Haz clic en "Modo Bloqueo Activado" para salir.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsBlockMode(false)}
                        className="text-red-500 hover:text-red-700 p-2"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                <span className="text-sm font-medium">Estados:</span>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm">Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                    <span className="text-sm">Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-sm">Cancelada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-500"></div>
                    <span className="text-sm">Completada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-500 border-2 border-dashed border-gray-600 opacity-50"></div>
                    <span className="text-sm">Bloqueado</span>
                </div>
            </div>

            {/* Calendar */}
            <div className={isBlockMode ? "ring-2 ring-red-500 ring-offset-2 rounded-xl transition-all" : ""}>
                <AdvancedCalendar
                    events={events}
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventResize}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                />
            </div>

            {/* Quick Appointment SlideOver */}
            <SlideOver
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedEvent ? 'Detalles de Cita' : 'Nueva Cita'}
                subtitle={
                    selectedSlot
                        ? `${selectedSlot.start.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}`
                        : selectedEvent
                        ? `${selectedEvent.start.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}`
                        : undefined
                }
                footer={
                    selectedEvent ? (
                        <div>
                            <button
                                onClick={handleResendConfirmation}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                            >
                                <Send className="h-4 w-4" />
                                Reenviar Confirmación
                            </button>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                Envía WhatsApp y Email al paciente
                            </p>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            form="quick-appointment-form"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            {loading ? 'Creando...' : <><Plus className="h-4 w-4" /> Crear Cita</>}
                        </button>
                    )
                }
            >
                {selectedEvent ? (
                    <div className="p-6 space-y-5">
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Paciente</p>
                                <p className="font-medium text-foreground">{selectedEvent.resource?.patientName}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-xl">
                                <p className="text-xs text-muted-foreground mb-1">Servicio</p>
                                <p className="text-sm font-medium text-foreground">{selectedEvent.resource?.serviceName || '—'}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-xl">
                                <p className="text-xs text-muted-foreground mb-1">Estado</p>
                                <p className="text-sm font-medium capitalize text-foreground">{selectedEvent.resource?.status}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-muted rounded-xl">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Horario
                            </p>
                            <p className="text-sm font-medium text-foreground">
                                {selectedEvent.start.toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' })} – {selectedEvent.end.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ) : (
                    <form id="quick-appointment-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Slot info */}
                        {selectedSlot && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                                <p className="text-sm text-blue-800 font-medium">
                                    {selectedSlot.start.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} – {selectedSlot.end.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Paciente *
                            </label>
                            <select
                                value={formData.patientId}
                                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-card text-foreground"
                                required
                            >
                                <option value="">Seleccionar paciente...</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.first_name} {p.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Servicio *
                            </label>
                            <select
                                value={formData.serviceId}
                                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-card text-foreground"
                                required
                            >
                                <option value="">Seleccionar servicio...</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} — ${s.price}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Notas (opcional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none bg-card text-foreground"
                                rows={3}
                                placeholder="Observaciones, indicaciones especiales..."
                            />
                        </div>
                    </form>
                )}
            </SlideOver>

            {/* Availability Block Modal */}
            <AvailabilityBlockModal
                isOpen={isBlockModalOpen}
                onClose={() => setIsBlockModalOpen(false)}
                onSuccess={() => {
                    loadData()
                    // Optional: Turn off block mode after creating a block
                    // setIsBlockMode(false) 
                }}
                initialStartTime={selectedSlot?.start}
                initialEndTime={selectedSlot?.end}
            />

            {/* Recurring Appointment Modal */}
            <RecurringAppointmentModal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                onSuccess={loadData}
                patients={patients}
                services={services}
            />
        </div>
    )
}

'use client'

import { useState, useCallback, useMemo } from 'react'
import { Calendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment'
import 'moment/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import './calendar-custom.css'

moment.locale('es')
const localizer = momentLocalizer(moment)
const DnDCalendar = withDragAndDrop(Calendar)

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
        physiotherapistId?: string
        isBlock?: boolean
        blockId?: string
        isGcal?: boolean
    }
}

interface AdvancedCalendarProps {
    events: CalendarEvent[]
    onEventDrop: (eventId: string, start: Date, end: Date) => Promise<void>
    onEventResize: (eventId: string, start: Date, end: Date) => Promise<void>
    onSelectSlot: (slotInfo: SlotInfo) => void
    onSelectEvent: (event: CalendarEvent) => void
}

export default function AdvancedCalendar({
    events,
    onEventDrop,
    onEventResize,
    onSelectSlot,
    onSelectEvent
}: AdvancedCalendarProps) {
    const [view, setView] = useState<View>(() => {
        // Load saved view from localStorage, default to 'week'
        if (typeof window !== 'undefined') {
            const savedView = localStorage.getItem('calendar-view')
            return (savedView as View) || 'week'
        }
        return 'week'
    })
    const [date, setDate] = useState(new Date())

    // Save view to localStorage whenever it changes
    const handleViewChange = useCallback((newView: View) => {
        setView(newView)
        if (typeof window !== 'undefined') {
            localStorage.setItem('calendar-view', newView)
        }
    }, [])

    // Event style getter for color coding
    const eventStyleGetter = useCallback((event: CalendarEvent) => {
        const status = event.resource?.status || 'pending'
        const isBlock = event.resource?.isBlock

        let backgroundColor = '#3b82f6' // Default blue

        if (isBlock) {
            // Reutilizar estilo para bloqueos de GCal
            const isGcal = event.resource?.isGcal;
            return {
                style: {
                    backgroundColor: isGcal ? '#4f46e5' : '#9ca3af', // Indigo para Gcal, Gris para bloqueos locales
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)',
                    borderRadius: '6px',
                    opacity: isGcal ? 0.9 : 0.8,
                    color: 'white',
                    border: isGcal ? '2px solid #4338ca' : '2px dashed #6b7280',
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'not-allowed'
                }
            }
        }

        switch (status) {
            case 'confirmed':
                backgroundColor = '#10b981' // Green
                break
            case 'pending':
                backgroundColor = '#f59e0b' // Orange
                break
            case 'cancelled':
                backgroundColor = '#ef4444' // Red
                break
            case 'completed':
                backgroundColor = '#6b7280' // Gray
                break
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '13px',
                fontWeight: '500'
            }
        }
    }, [])

    // Handle event drop (drag & drop)
    const handleEventDrop = useCallback(async ({ event, start, end }: any) => {
        // Prevent moving blocked slots
        if (event.resource?.isBlock) {
            return
        }
        await onEventDrop(event.id, start, end)
    }, [onEventDrop])

    // Handle event resize
    const handleEventResize = useCallback(async ({ event, start, end }: any) => {
        // Prevent resizing blocked slots
        if (event.resource?.isBlock) {
            return
        }
        await onEventResize(event.id, start, end)
    }, [onEventResize])

    // Custom messages in Spanish
    const messages = useMemo(() => ({
        allDay: 'Todo el día',
        previous: 'Anterior',
        next: 'Siguiente',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
        date: 'Fecha',
        time: 'Hora',
        event: 'Cita',
        noEventsInRange: 'No hay citas en este rango',
        showMore: (total: number) => `+ Ver más (${total})`
    }), [])

    return (
        <div className="h-[calc(100vh-200px)] bg-white rounded-xl border shadow-sm p-4">
            <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor={((event: CalendarEvent) => event.start) as any}
                endAccessor={((event: CalendarEvent) => event.end) as any}
                view={view}
                onView={handleViewChange}
                date={date}
                onNavigate={setDate}
                onSelectSlot={onSelectSlot}
                onSelectEvent={onSelectEvent as any}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                eventPropGetter={eventStyleGetter as any}
                messages={messages}
                selectable
                resizable
                popup
                step={15}
                timeslots={4}
                defaultView="week"
                views={['month', 'week', 'day']}
                min={new Date(2024, 0, 1, 7, 0, 0)} // 7 AM
                max={new Date(2024, 0, 1, 21, 0, 0)} // 9 PM
                scrollToTime={new Date()} // Auto-scroll to current time
                showMultiDayTimes
                getNow={() => new Date()} // Enable current time indicator
                formats={{
                    dayFormat: 'ddd DD',
                    weekdayFormat: 'dddd',
                    monthHeaderFormat: 'MMMM YYYY',
                    dayHeaderFormat: 'dddd, DD MMMM',
                    dayRangeHeaderFormat: ({ start, end }) =>
                        `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM YYYY')}`
                }}
                dayLayoutAlgorithm="no-overlap"
                components={{
                    toolbar: CustomToolbar
                }}
            />
        </div>
    )
}

// Custom Toolbar Component
function CustomToolbar({ label, onNavigate, onView, view }: any) {
    return (
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onNavigate('TODAY')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                    Hoy
                </button>
                <button
                    onClick={() => onNavigate('PREV')}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                    ←
                </button>
                <button
                    onClick={() => onNavigate('NEXT')}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                    →
                </button>
            </div>

            <h2 className="text-xl font-semibold">{label}</h2>

            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                    onClick={() => onView('day')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'day'
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-200'
                        }`}
                >
                    Día
                </button>
                <button
                    onClick={() => onView('week')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'week'
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-200'
                        }`}
                >
                    Semana
                </button>
                <button
                    onClick={() => onView('month')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'month'
                        ? 'bg-white shadow-sm'
                        : 'hover:bg-gray-200'
                        }`}
                >
                    Mes
                </button>
            </div>
        </div>
    )
}

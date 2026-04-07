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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    const [view, setView] = useState<View>(() => {
        if (typeof window !== 'undefined') {
            // On mobile default to day view; on desktop use saved preference
            if (window.innerWidth < 768) {
                return 'day'
            }
            const savedView = localStorage.getItem('calendar-view')
            return (savedView as View) || 'week'
        }
        return 'week'
    })
    const [date, setDate] = useState(new Date())

    // Save view to localStorage whenever it changes (desktop only)
    const handleViewChange = useCallback((newView: View) => {
        setView(newView)
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            localStorage.setItem('calendar-view', newView)
        }
    }, [])

    // Event style getter for color coding
    const eventStyleGetter = useCallback((event: CalendarEvent) => {
        const status = event.resource?.status || 'pending'
        const isBlock = event.resource?.isBlock

        if (isBlock) {
            const isGcal = event.resource?.isGcal;
            return {
                className: isGcal ? 'rbc-event-block-gcal' : 'rbc-event-block-local'
            }
        }

        return {
            className: `rbc-event-card rbc-event-status-${status}`
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
        <div className="h-[calc(100vh-200px)] bg-card rounded-xl overflow-hidden">
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
                views={['month', 'week', 'day', 'agenda']}
                min={new Date(2024, 0, 1, 7, 0, 0)}
                max={new Date(2024, 0, 1, 21, 0, 0)}
                scrollToTime={new Date()}
                showMultiDayTimes
                getNow={() => new Date()}
                formats={{
                    dayFormat: 'ddd DD',
                    weekdayFormat: (date: Date) => moment(date).format('ddd').toUpperCase(),
                    monthHeaderFormat: 'MMMM YYYY',
                    dayHeaderFormat: 'dddd, DD MMMM',
                    dayRangeHeaderFormat: ({ start, end }) =>
                        `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM YYYY')}`
                }}
                dayLayoutAlgorithm="no-overlap"
                components={{
                    toolbar: (props: any) => <CustomToolbar {...props} isMobile={isMobile} />,
                    month: {
                        dateHeader: ({ date, label }: any) => <MonthDateHeader date={date} label={label} />
                    }
                }}
            />
        </div>
    )
}

// Custom Toolbar Component
function CustomToolbar({ label, onNavigate, onView, view, isMobile }: any) {
    const views = [
        { key: 'month', label: 'Mes' },
        { key: 'week', label: 'Semana' },
        { key: 'day', label: 'Día' },
        { key: 'agenda', label: 'Lista' },
    ]

    return (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/40">
            {/* Left: label + nav arrows */}
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-wide uppercase text-foreground">
                    {label}
                </h2>
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => onNavigate('PREV')}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition text-sm"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => onNavigate('NEXT')}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition text-sm"
                    >
                        ›
                    </button>
                </div>
            </div>

            {/* Right: Today + view switcher */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onNavigate('TODAY')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition text-xs font-semibold whitespace-nowrap"
                >
                    Hoy
                </button>
                <div className="flex items-center bg-muted/60 rounded-lg p-0.5">
                    {views.map(({ key, label: lbl }) => (
                        <button
                            key={key}
                            onClick={() => onView(key)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
                                view === key
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {lbl}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Month date header with "today" circle
function MonthDateHeader({ date, label }: { date: Date; label: string }) {
    const isToday = moment(date).isSame(new Date(), 'day')
    return (
        <span
            className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full transition-colors ${
                isToday
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-foreground hover:bg-muted'
            }`}
        >
            {label}
        </span>
    )
}

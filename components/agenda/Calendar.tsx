'use client'

import { Calendar as BigCalendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, endOfWeek, addDays } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { getAppointments, updateAppointment } from '@/lib/actions/appointments'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const locales = {
    'es': es,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

const DnDCalendar = withDragAndDrop(BigCalendar)

interface Appointment {
    id: string
    title: string
    start: Date
    end: Date
    resourceId?: string
}

interface CalendarProps {
    initialEvents?: Appointment[]
    onSelectEvent?: (event: any) => void
}

export default function Calendar({ initialEvents = [], onSelectEvent }: CalendarProps) {
    const [view, setView] = useState<View>(Views.MONTH)
    const [date, setDate] = useState(new Date())
    const [events, setEvents] = useState<Appointment[]>(initialEvents)

    const fetchEvents = async (currentDate: Date, currentView: View) => {
        let start, end;

        if (currentView === Views.MONTH) {
            start = startOfWeek(startOfMonth(currentDate))
            end = endOfWeek(endOfMonth(currentDate))
        } else if (currentView === Views.WEEK) {
            start = startOfWeek(currentDate)
            end = endOfWeek(currentDate)
        } else { // Day view
            start = currentDate
            end = addDays(currentDate, 1)
        }

        const newEvents = await getAppointments(start, end)
        setEvents(newEvents)
    }

    // Fetch on mount and when date/view changes
    // Fetch on mount and when date/view changes
    useEffect(() => {
        fetchEvents(date, view)
    }, [date, view])

    const onEventDrop = async ({ event, start, end }: any) => {
        const appointmentId = event.id
        // Optimistic update
        const updatedEvents = events.map(evt => {
            if (evt.id === appointmentId) {
                return { ...evt, start, end }
            }
            return evt
        })
        setEvents(updatedEvents)

        try {
            await updateAppointment(appointmentId, { start, end })
        } catch (error) {
            console.error(error)
            // Revert on error
            fetchEvents(date, view)
        }
    }

    const onEventResize = async ({ event, start, end }: any) => {
        const appointmentId = event.id
        // Optimistic update
        const updatedEvents = events.map(evt => {
            if (evt.id === appointmentId) {
                return { ...evt, start, end }
            }
            return evt
        })
        setEvents(updatedEvents)

        try {
            await updateAppointment(appointmentId, { start, end })
        } catch (error) {
            console.error(error)
            // Revert on error
            fetchEvents(date, view)
        }
    }

    return (
        <div className="h-[calc(100vh-200px)] w-full bg-white/50 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white/20">
            <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor={(event: any) => event.start}
                endAccessor={(event: any) => event.end}
                style={{ height: '100%' }}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                culture='es'
                messages={{
                    next: "Siguiente",
                    previous: "Anterior",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    agenda: "Agenda",
                    date: "Fecha",
                    time: "Hora",
                    event: "Evento",
                    noEventsInRange: "No hay citas en este rango."
                }}
                draggableAccessor={() => true}
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                onSelectEvent={onSelectEvent}
                resizable
            />
        </div>
    )
}

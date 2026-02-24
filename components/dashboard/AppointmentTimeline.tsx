'use client'

import { Calendar, Clock, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Appointment {
    id: string
    patient_name: string
    service_name: string
    start_time: string
    status: string
}

interface AppointmentTimelineProps {
    appointments: Appointment[]
}

export default function AppointmentTimeline({ appointments }: AppointmentTimelineProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-500'
            case 'pending':
                return 'bg-yellow-500'
            case 'cancelled':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'Confirmada'
            case 'pending':
                return 'Pendiente'
            case 'cancelled':
                return 'Cancelada'
            default:
                return status
        }
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Citas de Hoy</h3>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="space-y-4">
                    {appointments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No hay citas programadas para hoy
                        </p>
                    ) : (
                        appointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(appointment.status)}`} />

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium">{appointment.patient_name}</p>
                                        <span className="text-xs text-muted-foreground">
                                            {getStatusText(appointment.status)}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        {appointment.service_name}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(appointment.start_time), 'HH:mm', { locale: es })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

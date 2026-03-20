'use client'

import { Calendar, Clock, Star } from 'lucide-react'

interface PatientTimelineProps {
    sessions: any[]
}

export default function PatientTimeline({ sessions }: PatientTimelineProps) {
    const getProgressColor = (rating: number) => {
        if (rating >= 4) return 'text-green-600 bg-green-100'
        if (rating >= 3) return 'text-yellow-600 bg-yellow-100'
        return 'text-red-600 bg-red-100'
    }

    const getProgressStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
            />
        ))
    }

    if (sessions.length === 0) {
        return (
            <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border shadow-sm p-8 text-center">
                <p className="text-muted-foreground">No hay sesiones registradas para este paciente.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Historial de Sesiones</h3>

            <div className="space-y-4">
                {sessions.map((session: any) => (
                    <div
                        key={session.id}
                        className="bg-card rounded-xl border border-border p-4 sm:p-6 hover:shadow-md transition"
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {new Date(session.session_date).toLocaleDateString('es-MX', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">{session.duration_minutes} min</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                {getProgressStars(session.progress_rating)}
                            </div>
                        </div>

                        <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1">Fisioterapeuta</p>
                            <p className="font-medium">{session.profiles?.full_name || 'No especificado'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Notas</p>
                            <p className="text-foreground whitespace-pre-wrap break-words text-sm sm:text-base">{session.notes}</p>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(session.progress_rating)}`}>
                                {session.progress_rating === 5 && 'Excelente progreso'}
                                {session.progress_rating === 4 && 'Buen progreso'}
                                {session.progress_rating === 3 && 'Progreso moderado'}
                                {session.progress_rating === 2 && 'Progreso mínimo'}
                                {session.progress_rating === 1 && 'Sin progreso'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

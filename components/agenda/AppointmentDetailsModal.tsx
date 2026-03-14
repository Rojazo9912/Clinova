'use client'

import { useState } from 'react'
import { sendAppointmentReminder } from '@/lib/actions/notifications'
import { toast } from 'sonner'

interface AppointmentDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    event: any // Using specific type would be better but keeping simple for now
}

export default function AppointmentDetailsModal({ isOpen, onClose, event }: AppointmentDetailsModalProps) {
    const [sending, setSending] = useState(false)

    if (!isOpen || !event) return null

    const handleSendReminder = async () => {
        setSending(true)
        try {
            const result = await sendAppointmentReminder(event.id)
            if (result.success) {
                toast.success('Recordatorio enviado con éxito')
            } else {
                toast.error('Error al enviar recordatorio: ' + (result.error || 'Desconocido'))
            }
        } catch (error) {
            console.error(error)
            toast.error('Error al enviar recordatorio')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
            <div className="w-full max-w-sm bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-2">{event.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleSendReminder}
                            disabled={sending}
                            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                        >
                            {sending ? 'Enviando...' : 'Enviar WhatsApp / Email'}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 text-foreground hover:bg-muted rounded-md bg-card border border-border"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

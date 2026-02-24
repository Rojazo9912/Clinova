'use client'

import { useState } from 'react'
import { sendAppointmentReminder } from '@/lib/actions/notifications'

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
                alert('Recordatorio enviado con éxito')
            } else {
                alert('Error al enviar recordatorio: ' + (result.error || 'Desconocido'))
            }
        } catch (error) {
            console.error(error)
            alert('Error al enviar')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h2>
                    <p className="text-sm text-slate-500 mb-4">
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
                            className="w-full px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-md bg-white border border-slate-200"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

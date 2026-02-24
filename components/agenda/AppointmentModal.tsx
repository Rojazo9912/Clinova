'use client'

import { useState, useEffect } from 'react'
import { createAppointment } from '@/lib/actions/appointments'
import PatientCombobox from '@/components/patients/PatientCombobox'

interface AppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    refreshCalendar: () => void
}

export default function AppointmentModal({ isOpen, onClose, refreshCalendar }: AppointmentModalProps) {
    const [loading, setLoading] = useState(false)
    const [patientId, setPatientId] = useState('')

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!patientId) {
            alert('Por favor selecciona un paciente')
            return
        }
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const date = formData.get('date') as string
        const startTime = formData.get('startTime') as string
        const endTime = formData.get('endTime') as string

        // Construct Date objects
        const start = new Date(`${date}T${startTime}`)
        const end = new Date(`${date}T${endTime}`)

        await createAppointment({
            start,
            end,
            patient_id: patientId
        })

        setLoading(false)
        refreshCalendar()
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4 text-slate-900">Nueva Cita</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
                            <PatientCombobox value={patientId} onChange={setPatientId} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Fecha</label>
                            <input type="date" name="date" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2 border" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Inicio</label>
                                <input type="time" name="startTime" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Fin</label>
                                <input type="time" name="endTime" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50 p-2 border" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : 'Guardar Cita'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

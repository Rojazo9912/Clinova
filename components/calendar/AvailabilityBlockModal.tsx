'use client'

import { useState, useEffect } from 'react'
import { createAvailabilityBlock } from '@/lib/actions/availability'
import { X, Clock, User, FileText } from 'lucide-react'

interface AvailabilityBlockModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    initialStartTime?: Date
    initialEndTime?: Date
    therapists?: Array<{ id: string; first_name: string; last_name: string }>
}

export default function AvailabilityBlockModal({
    isOpen,
    onClose,
    onSuccess,
    initialStartTime,
    initialEndTime,
    therapists = []
}: AvailabilityBlockModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        reason: '',
        therapistId: '',
        applyToAll: true
    })

    // Update form data when modal opens or props change
    useEffect(() => {
        if (isOpen && initialStartTime && initialEndTime) {
            // Helper precise date formatter
            const toLocalDate = (date: Date) => {
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
            }

            setFormData(prev => ({
                ...prev,
                startDate: toLocalDate(initialStartTime),
                startTime: initialStartTime.toTimeString().slice(0, 5),
                endDate: toLocalDate(initialEndTime),
                endTime: initialEndTime.toTimeString().slice(0, 5)
            }))
        }
    }, [isOpen, initialStartTime, initialEndTime])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
            const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

            if (endDateTime <= startDateTime) {
                setError('La hora de fin debe ser posterior a la hora de inicio')
                setLoading(false)
                return
            }

            await createAvailabilityBlock({
                start_time: startDateTime,
                end_time: endDateTime,
                reason: formData.reason,
                therapist_id: formData.applyToAll ? undefined : formData.therapistId
            })

            onSuccess()
            onClose()
        } catch (err) {
            console.error(err)
            setError('Error al crear el bloqueo de horario')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-red-500" />
                        Bloquear Horario
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Hora Inicio
                            </label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Hora Fin
                            </label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            <FileText className="h-4 w-4 inline mr-1" />
                            Razón
                        </label>
                        <input
                            type="text"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="Ej: Lunch, Junta, Día festivo"
                            required
                        />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.applyToAll}
                                onChange={(e) => setFormData({ ...formData, applyToAll: e.target.checked })}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <span className="text-sm font-medium">
                                Aplicar a toda la clínica
                            </span>
                        </label>

                        {!formData.applyToAll && therapists.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <User className="h-4 w-4 inline mr-1" />
                                    Fisioterapeuta
                                </label>
                                <select
                                    value={formData.therapistId}
                                    onChange={(e) => setFormData({ ...formData, therapistId: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    required={!formData.applyToAll}
                                >
                                    <option value="">Seleccionar fisioterapeuta</option>
                                    {therapists.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.first_name} {t.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creando...' : 'Bloquear Horario'}
                    </button>
                </form>
            </div>
        </div>
    )
}

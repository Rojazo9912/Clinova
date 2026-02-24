'use client'

import { useState } from 'react'
import { createRecurringAppointment, RecurrenceRule } from '@/lib/actions/recurring-appointments'
import { X, Calendar, User, Clock, Repeat } from 'lucide-react'

interface RecurringAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    patients: Array<{ id: string; first_name: string; last_name: string }>
    services: Array<{ id: string; name: string; price: number }>
    initialStartTime?: Date
}

export default function RecurringAppointmentModal({
    isOpen,
    onClose,
    onSuccess,
    patients,
    services,
    initialStartTime
}: RecurringAppointmentModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        patientId: '',
        serviceId: '',
        startDate: initialStartTime ? initialStartTime.toISOString().split('T')[0] : '',
        startTime: initialStartTime ? initialStartTime.toTimeString().slice(0, 5) : '',
        durationMinutes: 60,
        frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
        interval: 1,
        daysOfWeek: [] as number[],
        endType: 'occurrences' as 'occurrences' | 'date',
        occurrences: 8,
        endDate: '',
        notes: ''
    })

    if (!isOpen) return null

    const handleDayToggle = (day: number) => {
        setFormData(prev => ({
            ...prev,
            daysOfWeek: prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day].sort()
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)

            const recurrenceRule: RecurrenceRule = {
                frequency: formData.frequency,
                interval: formData.interval,
                daysOfWeek: formData.frequency === 'weekly' && formData.daysOfWeek.length > 0
                    ? formData.daysOfWeek
                    : undefined,
                endDate: formData.endType === 'date' ? formData.endDate : undefined,
                occurrences: formData.endType === 'occurrences' ? formData.occurrences : undefined
            }

            await createRecurringAppointment({
                patient_id: formData.patientId,
                service_id: formData.serviceId,
                start_time: startDateTime,
                duration_minutes: formData.durationMinutes,
                recurrence_rule: recurrenceRule,
                notes: formData.notes
            })

            onSuccess()
            onClose()
        } catch (err) {
            console.error(err)
            setError('Error al crear las citas recurrentes')
        } finally {
            setLoading(false)
        }
    }

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Repeat className="h-5 w-5 text-blue-500" />
                        Crear Citas Recurrentes
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
                                <User className="h-4 w-4 inline mr-1" />
                                Paciente
                            </label>
                            <select
                                value={formData.patientId}
                                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            >
                                <option value="">Seleccionar paciente</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.first_name} {p.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Servicio
                            </label>
                            <select
                                value={formData.serviceId}
                                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            >
                                <option value="">Seleccionar servicio</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} - ${s.price}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Calendar className="h-4 w-4 inline mr-1" />
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Clock className="h-4 w-4 inline mr-1" />
                                Hora
                            </label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Duración (min)
                            </label>
                            <input
                                type="number"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                min="15"
                                step="15"
                                required
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                        <h4 className="font-medium text-blue-900">Patrón de Recurrencia</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Frecuencia
                                </label>
                                <select
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="daily">Diaria</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensual</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Cada
                                </label>
                                <input
                                    type="number"
                                    value={formData.interval}
                                    onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        {formData.frequency === 'weekly' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Días de la semana
                                </label>
                                <div className="flex gap-2">
                                    {dayNames.map((day, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleDayToggle(index)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${formData.daysOfWeek.includes(index)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border hover:bg-gray-50'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Finaliza
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={formData.endType === 'occurrences'}
                                        onChange={() => setFormData({ ...formData, endType: 'occurrences' })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Después de</span>
                                    <input
                                        type="number"
                                        value={formData.occurrences}
                                        onChange={(e) => setFormData({ ...formData, occurrences: parseInt(e.target.value) })}
                                        className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        min="1"
                                        disabled={formData.endType !== 'occurrences'}
                                    />
                                    <span className="text-sm">sesiones</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        checked={formData.endType === 'date'}
                                        onChange={() => setFormData({ ...formData, endType: 'date' })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">En la fecha</span>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        disabled={formData.endType !== 'date'}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Notas (opcional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={2}
                            placeholder="Notas adicionales..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creando...' : (
                            <>
                                <Repeat className="h-4 w-4" />
                                Crear Serie de Citas
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

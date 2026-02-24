'use client'

import { useState, useEffect } from 'react'
import { recordPayment, getServices } from '@/lib/actions/finance'
import { searchPatients } from '@/lib/actions/patients'
import { X } from 'lucide-react'

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                const servicesData = await getServices()
                setServices(servicesData)
            }
            fetchData()
        }
    }, [isOpen])

    useEffect(() => {
        const fetchPatients = async () => {
            if (search.length > 2) {
                const data = await searchPatients(search)
                setPatients(data)
            }
        }
        const timer = setTimeout(fetchPatients, 300)
        return () => clearTimeout(timer)
    }, [search])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            await recordPayment(formData)
            onSuccess()
        } catch (error) {
            alert('Error al registrar pago')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Registrar Pago</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Buscar Paciente *</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nombre o email del paciente"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {patients.length > 0 && (
                            <select
                                name="patient_id"
                                required
                                className="w-full mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccionar paciente</option>
                                {patients.map((p: any) => (
                                    <option key={p.id} value={p.id}>
                                        {p.first_name} {p.last_name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Servicio</label>
                        <select
                            name="service_id"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sin servicio específico</option>
                            {services.map((s: any) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} - ${s.price}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Monto *</label>
                        <input
                            type="number"
                            name="amount"
                            required
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Método de Pago *</label>
                        <select
                            name="payment_method"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="cash">Efectivo</option>
                            <option value="card">Tarjeta</option>
                            <option value="transfer">Transferencia</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notas</label>
                        <textarea
                            name="notes"
                            rows={2}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

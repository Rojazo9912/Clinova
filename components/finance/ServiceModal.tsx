'use client'

import { useState } from 'react'
import { createService } from '@/lib/actions/finance'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface ServiceModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ServiceModal({ isOpen, onClose, onSuccess }: ServiceModalProps) {
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            await createService(formData)
            toast.success('Tratamiento creado exitosamente')
            onSuccess()
        } catch (error) {
            toast.error('Error al crear tratamiento')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Nuevo Tratamiento</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre del Tratamiento *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Ej: Sesión de Fisioterapia"
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-card text-foreground"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Descripción del tratamiento"
                            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-card text-foreground"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Precio *</label>
                            <input
                                type="number"
                                name="price"
                                required
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-card text-foreground"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Duración (min)</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                defaultValue={60}
                                min="1"
                                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-card text-foreground"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-foreground"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

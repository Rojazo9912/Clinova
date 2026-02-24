'use client'

import { useState } from 'react'
import { createPhysiotherapist, updatePhysiotherapist } from '@/lib/actions/physiotherapists'
import { X } from 'lucide-react'

interface PhysiotherapistModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    physiotherapist?: any | null
}

export default function PhysiotherapistModal({ isOpen, onClose, onSuccess, physiotherapist }: PhysiotherapistModalProps) {
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)

            if (physiotherapist) {
                await updatePhysiotherapist(physiotherapist.id, formData)
            } else {
                await createPhysiotherapist(formData)
            }

            onSuccess()
        } catch (error) {
            alert('Error al guardar fisioterapeuta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        {physiotherapist ? 'Editar Fisioterapeuta' : 'Nuevo Fisioterapeuta'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
                            <input
                                type="text"
                                name="full_name"
                                required
                                defaultValue={physiotherapist?.full_name}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Email *</label>
                            <input
                                type="email"
                                name="email"
                                required
                                disabled={!!physiotherapist?.email}
                                defaultValue={physiotherapist?.email || ''}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Teléfono</label>
                            <input
                                type="tel"
                                name="phone"
                                defaultValue={physiotherapist?.phone}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Número de Licencia</label>
                            <input
                                type="text"
                                name="license_number"
                                defaultValue={physiotherapist?.license_number}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Especialidades (separadas por coma)</label>
                        <input
                            type="text"
                            name="specialties"
                            placeholder="Ej: Deportiva, Neurológica, Pediátrica"
                            defaultValue={physiotherapist?.specialties?.join(', ')}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Biografía</label>
                        <textarea
                            name="bio"
                            rows={4}
                            defaultValue={physiotherapist?.bio}
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

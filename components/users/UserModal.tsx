'use client'

import { useState } from 'react'
import { createUser, updateUser } from '@/lib/actions/users'
import { getRoles } from '@/lib/actions/roles'
import { useEffect } from 'react'

import { X } from 'lucide-react'

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    user?: any | null
}

export default function UserModal({ isOpen, onClose, onSuccess, user }: UserModalProps) {
    const [loading, setLoading] = useState(false)
    const [roles, setRoles] = useState<any[]>([])
    const [loadingRoles, setLoadingRoles] = useState(false)

    useEffect(() => {
        if (isOpen) {
            const fetchRoles = async () => {
                setLoadingRoles(true)
                try {
                    const data = await getRoles()
                    setRoles(data)
                } catch (error) {
                    console.error('Error fetching roles', error)
                } finally {
                    setLoadingRoles(false)
                }
            }
            fetchRoles()
        }
    }, [isOpen])



    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)

            if (user) {
                await updateUser(user.id, formData)
            } else {
                await createUser(formData)
            }

            onSuccess()
        } catch (error) {
            alert('Error al guardar usuario')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        {user ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
                        <input
                            type="text"
                            name="full_name"
                            required
                            defaultValue={user?.full_name}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input
                            type="email"
                            name="email"
                            required
                            disabled={!!user}
                            defaultValue={user?.email}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <input
                            type="tel"
                            name="phone"
                            defaultValue={user?.phone}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Rol *</label>
                        <select
                            name="role"
                            required
                            defaultValue={user?.role || ''}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Seleccionar rol</option>
                            {loadingRoles ? (
                                <option disabled>Cargando roles...</option>
                            ) : (
                                roles
                                    .filter(r => r.code !== 'super_admin') // Hide super_admin
                                    .map(role => (
                                        <option key={role.code} value={role.code}>
                                            {role.name}
                                        </option>
                                    ))
                            )}
                        </select>
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
            </div >
        </div >
    )
}

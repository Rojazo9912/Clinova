'use client'

import { useState } from 'react'
import { createRole, updateRole } from '@/lib/actions/roles'
import { X, Shield } from 'lucide-react'
import { PERMISSIONS } from '@/lib/auth/permissions'

interface RoleModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    role?: any | null
}

const PERMISSION_GROUPS = [
    {
        name: 'Dashboard',
        permissions: [
            { label: 'Ver Dashboard', value: PERMISSIONS.VIEW_DASHBOARD },
        ]
    },
    {
        name: 'Agenda',
        permissions: [
            { label: 'Ver Agenda', value: PERMISSIONS.VIEW_AGENDA },
            { label: 'Gestionar Agenda', value: PERMISSIONS.MANAGE_AGENDA },
        ]
    },
    {
        name: 'Pacientes',
        permissions: [
            { label: 'Ver Pacientes', value: PERMISSIONS.VIEW_PATIENTS },
            { label: 'Gestionar Pacientes', value: PERMISSIONS.MANAGE_PATIENTS },
        ]
    },
    {
        name: 'Expedientes (EMR)',
        permissions: [
            { label: 'Ver Expedientes', value: PERMISSIONS.VIEW_EMR },
            { label: 'Gestionar Expedientes', value: PERMISSIONS.MANAGE_EMR },
        ]
    },
    {
        name: 'Fisioterapeutas',
        permissions: [
            { label: 'Ver Fisioterapeutas', value: PERMISSIONS.VIEW_PHYSIOS },
            { label: 'Gestionar Fisioterapeutas', value: PERMISSIONS.MANAGE_PHYSIOS },
        ]
    },
    {
        name: 'Usuarios',
        permissions: [
            { label: 'Ver Usuarios', value: PERMISSIONS.VIEW_USERS },
            { label: 'Gestionar Usuarios', value: PERMISSIONS.MANAGE_USERS },
        ]
    },
    {
        name: 'Finanzas',
        permissions: [
            { label: 'Ver Finanzas', value: PERMISSIONS.VIEW_FINANCE },
            { label: 'Gestionar Finanzas', value: PERMISSIONS.MANAGE_FINANCE },
        ]
    },
    {
        name: 'Ejercicios',
        permissions: [
            { label: 'Ver Ejercicios', value: PERMISSIONS.VIEW_EXERCISES },
            { label: 'Gestionar Ejercicios', value: PERMISSIONS.MANAGE_EXERCISES },
        ]
    },
    {
        name: 'Plantillas',
        permissions: [
            { label: 'Ver Plantillas', value: PERMISSIONS.VIEW_TEMPLATES },
            { label: 'Gestionar Plantillas', value: PERMISSIONS.MANAGE_TEMPLATES },
        ]
    },
    {
        name: 'Configuración',
        permissions: [
            { label: 'Ver Configuración', value: PERMISSIONS.VIEW_SETTINGS },
            { label: 'Gestionar Configuración', value: PERMISSIONS.MANAGE_SETTINGS },
        ]
    },
]

export default function RoleModal({ isOpen, onClose, onSuccess, role }: RoleModalProps) {
    const [loading, setLoading] = useState(false)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || [])

    if (!isOpen) return null

    const handlePermissionChange = (permission: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        )
    }

    const toggleAll = (groupPermissions: string[]) => {
        const allSelected = groupPermissions.every(p => selectedPermissions.includes(p))
        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(p => !groupPermissions.includes(p)))
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...groupPermissions])])
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            formData.append('permissions', JSON.stringify(selectedPermissions))

            if (role) {
                await updateRole(role.code, formData)
            } else {
                await createRole(formData)
            }

            onSuccess()
        } catch (error) {
            console.error(error)
            alert('Error al guardar rol')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                        {role ? 'Editar Rol' : 'Nuevo Rol'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre del Rol *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                defaultValue={role?.name}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej. Recepcionista"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Código (Identificador) *</label>
                            <input
                                type="text"
                                name="code"
                                required
                                disabled={!!role}
                                defaultValue={role?.code}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                placeholder="Ej. receptionist"
                                pattern="[a-z0-9_]+"
                                title="Solo letras minúsculas, números y guiones bajos"
                            />
                            <p className="text-xs text-slate-500 mt-1">Único, sin espacios. No se puede cambiar después.</p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Permisos</h3>
                        <div className="space-y-4">
                            {PERMISSION_GROUPS.map((group) => (
                                <div key={group.name} className="bg-slate-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-sm text-slate-700">{group.name}</h4>
                                        <button
                                            type="button"
                                            onClick={() => toggleAll(group.permissions.map(p => p.value))}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Seleccionar todo
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {group.permissions.map((perm) => (
                                            <label key={perm.value} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(perm.value)}
                                                    onChange={() => handlePermissionChange(perm.value)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                {perm.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || selectedPermissions.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar Rol'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

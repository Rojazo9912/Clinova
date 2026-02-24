'use client'

import { useEffect, useState } from 'react'
import { getRoles, deleteRole } from '@/lib/actions/roles'
import RoleModal from '@/components/roles/RoleModal'
import PageHeader from '@/components/ui/PageHeader'
import { Trash2, Edit, Shield } from 'lucide-react'

interface Role {
    code: string
    name: string
    permissions: string[]
    is_system: boolean
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [loading, setLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true)
            const data = await getRoles()
            setRoles(data as Role[])
            setLoading(false)
        }
        fetchRoles()
    }, [refreshKey])

    const handleEdit = (role: Role) => {
        setEditingRole(role)
        setIsModalOpen(true)
    }

    const handleDelete = async (code: string) => {
        if (!confirm('¿Estás seguro de eliminar este rol?')) return

        try {
            await deleteRole(code)
            setRefreshKey(k => k + 1)
        } catch (error) {
            alert('Error al eliminar rol')
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingRole(null)
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Roles y Permisos" description="Gestiona los roles de usuario y sus niveles de acceso.">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    <Shield className="h-4 w-4" />
                    Nuevo Rol
                </button>
            </PageHeader>

            <div className="bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Código</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Permisos</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading && roles.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando...</td>
                            </tr>
                        ) : roles.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No hay roles registrados.</td>
                            </tr>
                        ) : (
                            roles.map((role) => (
                                <tr key={role.code} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                        {role.name}
                                        {role.is_system && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">Sistema</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{role.code}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {role.permissions.includes('*')
                                            ? 'Acceso Total'
                                            : `${role.permissions.length} permisos`}
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(role)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Editar Rol"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        {!role.is_system && (
                                            <button
                                                onClick={() => handleDelete(role.code)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Eliminar Rol"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <RoleModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={() => {
                    setRefreshKey(k => k + 1)
                    handleCloseModal()
                }}
                role={editingRole}
            />
        </div>
    )
}

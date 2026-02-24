'use client'

import { useEffect, useState } from 'react'
import { getUsers, deleteUser } from '@/lib/actions/users'
import { getRoles } from '@/lib/actions/roles'
import UserModal from '@/components/users/UserModal'


import PageHeader from '@/components/ui/PageHeader'
import { Trash2, Edit } from 'lucide-react'

interface User {
    id: string
    full_name: string
    email: string
    phone: string | null
    role: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<any[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const [usersData, rolesData] = await Promise.all([
                getUsers(),
                getRoles()
            ])
            setUsers(usersData as User[])
            setRoles(rolesData)
            setLoading(false)
        }
        fetchData()
    }, [refreshKey])


    const handleEdit = (user: User) => {
        setEditingUser(user)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return

        try {
            await deleteUser(id)
            setRefreshKey(k => k + 1)
        } catch (error) {
            alert('Error al eliminar usuario')
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingUser(null)
    }

    const getRoleName = (roleCode: string) => {
        const role = roles.find(r => r.code === roleCode)
        return role ? role.name : roleCode
    }


    return (
        <div className="space-y-6">
            <PageHeader title="Usuarios" description="Administra el personal de tu clínica.">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    Nuevo Usuario
                </button>
            </PageHeader>

            <div className="bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Teléfono</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Rol</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Cargando...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay usuarios registrados.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{user.full_name}</td>
                                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4 text-slate-600">{user.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                            {getRoleName(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={() => {
                    setRefreshKey(k => k + 1)
                    handleCloseModal()
                }}
                user={editingUser}
            />
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { getPhysiotherapists, deletePhysiotherapist } from '@/lib/actions/physiotherapists'
import PhysiotherapistModal from '@/components/physiotherapists/PhysiotherapistModal'
import PageHeader from '@/components/ui/PageHeader'
import { Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface Physiotherapist {
    id: string
    full_name: string
    email?: string
    phone: string | null
    specialties: string[] | null
    license_number: string | null
    bio: string | null
}

export default function PhysiotherapistsPage() {
    const [physios, setPhysios] = useState<Physiotherapist[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPhysio, setEditingPhysio] = useState<Physiotherapist | null>(null)
    const [loading, setLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const fetchPhysios = async () => {
            setLoading(true)
            const data = await getPhysiotherapists()
            setPhysios(data as Physiotherapist[])
            setLoading(false)
        }
        fetchPhysios()
    }, [refreshKey])

    const handleEdit = (physio: Physiotherapist) => {
        setEditingPhysio(physio)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este fisioterapeuta?')) return

        try {
            await deletePhysiotherapist(id)
            setRefreshKey(k => k + 1)
        } catch (error) {
            toast.error('Error al eliminar fisioterapeuta')
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingPhysio(null)
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Fisioterapeutas" description="Gestiona el equipo de fisioterapeutas de tu clínica.">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    Nuevo Fisioterapeuta
                </button>
            </PageHeader>

            <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Nombre</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Teléfono</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Especialidades</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Licencia</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Cargando...</td>
                            </tr>
                        ) : physios.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No hay fisioterapeutas registrados.</td>
                            </tr>
                        ) : (
                            physios.map((physio) => (
                                <tr key={physio.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4 font-medium text-foreground">{physio.full_name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{physio.email || '-'}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{physio.phone || '-'}</td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {physio.specialties?.join(', ') || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{physio.license_number || '-'}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(physio)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(physio.id)}
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

            <PhysiotherapistModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={() => {
                    setRefreshKey(k => k + 1)
                    handleCloseModal()
                }}
                physiotherapist={editingPhysio}
            />
        </div>
    )
}

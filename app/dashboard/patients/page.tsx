'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchPatients } from '@/lib/actions/patients'
import { grantPortalAccess } from '@/lib/actions/patient-portal-access'
import PatientModal from '@/components/patients/PatientModal'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'
import { Key, ShieldOff, Bell, BellOff, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { togglePatientReminders } from '@/lib/actions/reminders'

interface Patient {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    reminders_enabled?: boolean
    hasPortalAccess?: boolean
    grantingAccess?: boolean
    patient_users?: { is_active: boolean }[]
    last_session_date?: string | null
}

function getActivityStatus(lastSessionDate: string | null | undefined) {
    if (!lastSessionDate) return { label: 'Sin sesiones', color: 'text-muted-foreground bg-muted', days: null }
    const days = Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 30) return { label: `Hace ${days}d`, color: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20', days }
    if (days <= 60) return { label: `Hace ${days}d`, color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', days }
    return { label: `Hace ${days}d`, color: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20', days }
}

export default function PatientsPage() {
    const searchParams = useSearchParams()
    const [patients, setPatients] = useState<Patient[]>([])
    const [search, setSearch] = useState('')
    const [filterInactive, setFilterInactive] = useState(searchParams.get('filter') === 'inactive')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true)
            const data = await searchPatients(search)

            // Map data to include hasPortalAccess
            const patientsWithAccess = (data as any[]).map((patient) => ({
                ...patient,
                hasPortalAccess: patient.patient_users?.[0]?.is_active ?? false
            }))

            setPatients(patientsWithAccess)
            setLoading(false)
        }
        fetchPatients()
    }, [search, refreshKey])

    const handleGrantAccess = async (patientId: string) => {
        setPatients(prev => prev.map(p =>
            p.id === patientId ? { ...p, grantingAccess: true } : p
        ))

        const result = await grantPortalAccess(patientId)

        if (result.success) {
            setRefreshKey(k => k + 1)
        } else {
            toast.error(result.message)
            setPatients(prev => prev.map(p =>
                p.id === patientId ? { ...p, grantingAccess: false } : p
            ))
        }
    }

    async function handleToggleReminders(patientId: string, currentValue: boolean) {
        try {
            await togglePatientReminders(patientId, !currentValue)
            setRefreshKey(prev => prev + 1)
        } catch (error: any) {
            toast.error(error.message || 'Error inesperado')
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Pacientes" description="Gestiona el expediente de tus pacientes.">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    Nuevo Paciente
                </button>
            </PageHeader>

            <div className="flex items-center gap-3 flex-wrap">
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    className="w-full max-w-sm px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-card text-foreground placeholder:text-muted-foreground"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    onClick={() => setFilterInactive(f => !f)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition ${
                        filterInactive
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                            : 'bg-card border-border text-muted-foreground hover:border-border'
                    }`}
                >
                    <UserX className="w-3.5 h-3.5" />
                    Solo inactivos (+30 días)
                </button>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Nombre</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Teléfono</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Portal</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Clínica</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Último contacto</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Recordatorios</th>
                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">Cargando...</td>
                            </tr>
                        ) : patients.filter(p => !filterInactive || (getActivityStatus(p.last_session_date).days === null || (getActivityStatus(p.last_session_date).days ?? 0) > 30)).length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-4xl select-none">🔍</span>
                                        <p className="font-semibold text-foreground">Sin resultados</p>
                                        <p className="text-sm text-muted-foreground">
                                            {search ? `No hay pacientes que coincidan con "${search}"` : 'No hay pacientes registrados aún'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            patients
                                .filter(p => !filterInactive || (getActivityStatus(p.last_session_date).days === null || (getActivityStatus(p.last_session_date).days ?? 0) > 30))
                                .map((patient) => (
                                <tr key={patient.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4 font-medium text-foreground">{patient.first_name} {patient.last_name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{patient.email || '-'}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{patient.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        {patient.hasPortalAccess ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                                                <Key className="w-3 h-3" />
                                                Acceso activo
                                            </span>
                                        ) : patient.email ? (
                                            <button
                                                onClick={() => handleGrantAccess(patient.id)}
                                                disabled={patient.grantingAccess}
                                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
                                            >
                                                {patient.grantingAccess ? 'Otorgando...' : (
                                                    <>
                                                        <Key className="w-3 h-3" />
                                                        Dar Acceso
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
                                                <ShieldOff className="w-3 h-3" />
                                                Sin email
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-muted-foreground">
                                        {(patient as any).clinics?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            const status = getActivityStatus(patient.last_session_date)
                                            return (
                                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            )
                                        })()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleReminders(patient.id, patient.reminders_enabled ?? true)}
                                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition ${patient.reminders_enabled !== false
                                                ? 'text-green-700 bg-green-50 hover:bg-green-100'
                                                : 'text-muted-foreground bg-muted hover:bg-muted/80'
                                                }`}
                                        >
                                            {patient.reminders_enabled !== false ? (
                                                <><Bell className="w-3 h-3" /> Activos</>
                                            ) : (
                                                <><BellOff className="w-3 h-3" /> Desactivados</>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/patients/${patient.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <PatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => setRefreshKey(k => k + 1)}
            />
        </div>
    )
}

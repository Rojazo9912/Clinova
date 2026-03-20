'use client'

import { useState, useEffect } from 'react'
import { searchPatients } from '@/lib/actions/patients'
import { getTherapySessions, createTherapySession } from '@/lib/actions/medical-records'
import PageHeader from '@/components/ui/PageHeader'
import SessionModal from '@/components/emr/SessionModal'
import PatientTimeline from '@/components/emr/PatientTimeline'
import { Search } from 'lucide-react'

export default function EMRPage() {
    const [search, setSearch] = useState('')
    const [patients, setPatients] = useState<any[]>([])
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const fetchPatients = async () => {
            if (search.length > 2) {
                const data = await searchPatients(search)
                setPatients(data)
            } else {
                setPatients([])
            }
        }
        const timer = setTimeout(fetchPatients, 300)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        if (selectedPatient) {
            const fetchSessions = async () => {
                const data = await getTherapySessions(selectedPatient.id)
                setSessions(data)
            }
            fetchSessions()
        }
    }, [selectedPatient, refreshKey])

    const handleSelectPatient = (patient: any) => {
        setSelectedPatient(patient)
        setSearch('')
        setPatients([])
    }

    // Calculate patient age
    const patientAge = selectedPatient?.birth_date
        ? Math.floor((new Date().getTime() - new Date(selectedPatient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : undefined

    const patientFullName = selectedPatient
        ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
        : undefined

    return (
        <div className="space-y-6">
            <PageHeader
                title="Expediente Clínico Electrónico"
                description="Gestiona el historial médico y sesiones de terapia."
            >
                {selectedPatient && (
                    <button
                        onClick={() => setIsSessionModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        Nueva Sesión
                    </button>
                )}
            </PageHeader>

            {/* Patient Search */}
            <div className="bg-card/50 backdrop-blur-md rounded-xl border border-border shadow-sm p-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Buscar paciente por nombre o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 bg-card text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                {patients.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {patients.map((patient: any) => (
                            <button
                                key={patient.id}
                                onClick={() => handleSelectPatient(patient)}
                                className="w-full text-left px-4 py-3 bg-card rounded-lg hover:bg-muted transition border border-border"
                            >
                                <p className="font-medium text-foreground">{patient.first_name} {patient.last_name}</p>
                                <p className="text-sm text-muted-foreground">{patient.email}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Patient Info & Timeline */}
            {selectedPatient && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                        <h3 className="text-2xl font-bold text-foreground">
                            {selectedPatient.first_name} {selectedPatient.last_name}
                        </h3>
                        <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">📧 {selectedPatient.email || 'Sin email'}</span>
                            <span className="flex items-center gap-1">📞 {selectedPatient.phone || 'Sin teléfono'}</span>
                        </div>
                    </div>

                    <PatientTimeline sessions={sessions} />
                </div>
            )}

            {!selectedPatient && (
                <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Busca un paciente para ver su expediente clínico</p>
                </div>
            )}

            <SessionModal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                onSuccess={() => {
                    setRefreshKey(k => k + 1)
                    setIsSessionModalOpen(false)
                }}
                patientId={selectedPatient?.id}
                patientName={patientFullName}
                patientAge={patientAge}
            />
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { searchPatients } from '@/lib/actions/patients'
import { getTherapySessions } from '@/lib/actions/medical-records'
import PageHeader from '@/components/ui/PageHeader'
import SessionModal from '@/components/emr/SessionModal'
import InitialEvaluationWizard from '@/components/emr/InitialEvaluationWizard'
import PatientTimeline from '@/components/emr/PatientTimeline'
import { Search, ClipboardList, Plus } from 'lucide-react'

export default function EMRPage() {
    const [search, setSearch] = useState('')
    const [patients, setPatients] = useState<any[]>([])
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
    const [isInitialEvalOpen, setIsInitialEvalOpen] = useState(false)
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
            getTherapySessions(selectedPatient.id).then(setSessions)
        }
    }, [selectedPatient, refreshKey])

    const handleSelectPatient = (patient: any) => {
        setSelectedPatient(patient)
        setSearch('')
        setPatients([])
    }

    const patientAge = selectedPatient?.birth_date
        ? Math.floor((new Date().getTime() - new Date(selectedPatient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : undefined

    const patientFullName = selectedPatient
        ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
        : undefined

    const isFirstVisit = sessions.length === 0

    return (
        <div className="space-y-6">
            <PageHeader
                title="Expediente Clínico Electrónico"
                description="Gestiona el historial médico y sesiones de terapia."
            >
                {selectedPatient && (
                    <div className="flex gap-2">
                        {/* Show Primera Consulta if no sessions exist, else show Nueva Sesión */}
                        {isFirstVisit ? (
                            <button
                                onClick={() => setIsInitialEvalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition font-medium text-sm"
                            >
                                <ClipboardList className="w-4 h-4" />
                                Primera Consulta
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsInitialEvalOpen(true)}
                                    className="flex items-center gap-2 px-3 py-2 border border-border text-muted-foreground rounded-xl hover:bg-muted transition text-sm"
                                >
                                    <ClipboardList className="w-4 h-4" />
                                    Nueva evaluación
                                </button>
                                <button
                                    onClick={() => setIsSessionModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition font-medium text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nueva Sesión
                                </button>
                            </>
                        )}
                    </div>
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
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">
                                    {selectedPatient.first_name} {selectedPatient.last_name}
                                </h3>
                                <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">📧 {selectedPatient.email || 'Sin email'}</span>
                                    <span className="flex items-center gap-1">📞 {selectedPatient.phone || 'Sin teléfono'}</span>
                                    {patientAge && <span className="flex items-center gap-1">🎂 {patientAge} años</span>}
                                </div>
                            </div>
                            {isFirstVisit && (
                                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
                                    Sin sesiones
                                </span>
                            )}
                        </div>
                        {isFirstVisit && (
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 flex items-center gap-3">
                                <ClipboardList className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Este paciente no tiene expediente clínico</p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400">Comienza con una <strong>Primera Consulta</strong> para crear el expediente completo.</p>
                                </div>
                                <button
                                    onClick={() => setIsInitialEvalOpen(true)}
                                    className="ml-auto px-3 py-1.5 bg-yellow-600 text-white rounded-lg text-xs font-semibold hover:bg-yellow-700 transition flex-shrink-0">
                                    Iniciar
                                </button>
                            </div>
                        )}
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
                onSuccess={() => { setRefreshKey(k => k + 1); setIsSessionModalOpen(false) }}
                patientId={selectedPatient?.id}
                patientName={patientFullName}
                patientAge={patientAge}
            />

            <InitialEvaluationWizard
                isOpen={isInitialEvalOpen}
                onClose={() => setIsInitialEvalOpen(false)}
                onSuccess={() => { setRefreshKey(k => k + 1); setIsInitialEvalOpen(false) }}
                patientId={selectedPatient?.id}
                patientName={patientFullName}
                patientAge={patientAge}
            />
        </div>
    )
}

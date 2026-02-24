'use client'

import { useEffect, useState } from 'react'
import { getPatientMedicalRecords } from '@/lib/actions/portal'
import { FileText, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface MedicalRecord {
    id: string
    session_date: string
    diagnosis: string | null
    treatment: string | null
    notes: string | null
    service: { name: string }
    physiotherapist: { first_name: string; last_name: string }
}

export default function MedicalRecordsPage() {
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadRecords() {
            const data = await getPatientMedicalRecords()
            setRecords(data as MedicalRecord[])
            setLoading(false)
        }
        loadRecords()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Expediente Médico</h1>
                <p className="text-slate-600 mt-2">Historial de sesiones y tratamientos</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-slate-500">Cargando...</p>
                </div>
            ) : records.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No hay registros médicos</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map((record) => (
                        <div key={record.id} className="bg-white rounded-xl border p-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-900">{record.service.name}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {format(new Date(record.session_date), "d 'de' MMMM, yyyy", { locale: es })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {record.physiotherapist.first_name} {record.physiotherapist.last_name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {record.diagnosis && (
                                        <div className="mb-3">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-1">Diagnóstico</h4>
                                            <p className="text-sm text-slate-600">{record.diagnosis}</p>
                                        </div>
                                    )}

                                    {record.treatment && (
                                        <div className="mb-3">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-1">Tratamiento</h4>
                                            <p className="text-sm text-slate-600">{record.treatment}</p>
                                        </div>
                                    )}

                                    {record.notes && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-700 mb-1">Notas</h4>
                                            <p className="text-sm text-slate-600">{record.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

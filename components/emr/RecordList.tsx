'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface MedicalRecord {
    id: string
    diagnosis: string
    treatment_plan: string
    notes: string | null
    created_at: string
    doctor_id: string | null
    profiles: {
        full_name: string | null
    } | null
}

interface RecordListProps {
    records: MedicalRecord[]
}

export default function RecordList({ records }: RecordListProps) {
    if (records.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">No hay historial clínico registrado.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {records.map((record) => (
                <div key={record.id} className="relative pl-8 pb-6 border-l-2 border-blue-100 last:pb-0">
                    <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-50"></div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-5 hover:shadow-md transition duration-200">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="text-lg font-bold text-slate-800">{record.diagnosis}</h4>
                                <p className="text-sm text-slate-500">
                                    {format(new Date(record.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                                </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {record.profiles?.full_name || 'Fisioterapeuta'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tratamiento</h5>
                                <p className="text-slate-700 bg-slate-50 p-3 rounded-md text-sm whitespace-pre-line border border-slate-100">
                                    {record.treatment_plan}
                                </p>
                            </div>

                            {record.notes && (
                                <div>
                                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notas</h5>
                                    <p className="text-slate-600 text-sm">
                                        {record.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

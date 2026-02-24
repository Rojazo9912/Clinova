'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PatientModal from './PatientModal'
import Link from 'next/link'
import { Activity, Pencil, CalendarPlus, ClipboardPlus } from 'lucide-react'

interface PatientActionsProps {
    patient: any
    patientId: string
}

export default function PatientActions({ patient, patientId }: PatientActionsProps) {
    const [showEditModal, setShowEditModal] = useState(false)
    const router = useRouter()

    return (
        <>
            <div className="flex flex-wrap gap-2">
                <Link
                    href={`/dashboard/patients/${patientId}/intake`}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium shadow flex items-center gap-2"
                >
                    <ClipboardPlus className="w-4 h-4" />
                    Evaluación Inicial
                </Link>
                <Link
                    href={`/dashboard/patients/${patientId}/evolution`}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium shadow-sm flex items-center gap-2"
                >
                    <Activity className="w-4 h-4" />
                    Evolución
                </Link>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium shadow-sm flex items-center gap-2"
                >
                    <Pencil className="w-4 h-4" />
                    Editar Perfil
                </button>
                <Link
                    href={`/dashboard/agenda`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow flex items-center gap-2"
                >
                    <CalendarPlus className="w-4 h-4" />
                    Agendar Cita
                </Link>
            </div>

            <PatientModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => router.refresh()}
                patient={patient}
            />
        </>
    )
}

import { getPatientById } from '@/lib/actions/patients'
import { checkPatientHasAccess } from '@/lib/actions/patient-portal-access'
import IntakeEvaluationForm from '@/components/patients/IntakeEvaluationForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function IntakePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const patient = await getPatientById(id)

    if (!patient) notFound()

    const patientAge = patient.birth_date
        ? Math.floor((new Date().getTime() - new Date(patient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : undefined

    const portalAccess = await checkPatientHasAccess(id)

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Link
                    href={`/dashboard/patients/${id}`}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al perfil
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">
                    Evaluación Inicial — {patient.first_name} {patient.last_name}
                </h1>
            </div>

            <IntakeEvaluationForm
                patientId={id}
                patientName={`${patient.first_name} ${patient.last_name}`}
                patientAge={patientAge}
                patientEmail={patient.email}
                hasPortalAccess={!!portalAccess}
            />
        </div>
    )
}

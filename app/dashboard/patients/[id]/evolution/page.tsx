import { getPatientById } from '@/lib/actions/patients'
import { getPatientMeasurements, getPatientProgress } from '@/lib/actions/clinical-measurements'
import MeasurementLog from '@/components/patients/history/MeasurementLog'
import ProgressSummary from '@/components/patients/history/ProgressSummary'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EvolutionPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params

    const patient = await getPatientById(resolvedParams.id)
    const history = await getPatientMeasurements(resolvedParams.id)
    const progress = await getPatientProgress(resolvedParams.id)

    if (!patient) {
        return <div>Paciente no encontrado</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href={`/dashboard/patients/${resolvedParams.id}`}
                    className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Evolución Clínica
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {patient.first_name} {patient.last_name}
                    </p>
                </div>
            </div>

            {/* Progress Summary Cards */}
            <ProgressSummary progress={progress} />

            {/* Measurement Log with Charts & Body Map */}
            <MeasurementLog
                patientId={patient.id}
                initialHistory={history}
            />
        </div>
    )
}

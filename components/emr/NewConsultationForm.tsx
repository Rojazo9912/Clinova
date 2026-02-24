'use client'

import { useState, useEffect } from 'react'
import { createMedicalRecord } from '@/lib/actions/medical-records'
import { getNoteTemplates, NoteTemplate } from '@/lib/actions/note-templates'
import { useRouter } from 'next/navigation'
import { FileText, X } from 'lucide-react'

interface NewConsultationFormProps {
    patientId: string
    patientName?: string
    patientAge?: number
    onSuccess?: () => void
}

export default function NewConsultationForm({ patientId, patientName, patientAge, onSuccess }: NewConsultationFormProps) {
    const [loading, setLoading] = useState(false)
    const [templates, setTemplates] = useState<NoteTemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<string>('')
    const [diagnosis, setDiagnosis] = useState('')
    const [treatmentPlan, setTreatmentPlan] = useState('')
    const [notes, setNotes] = useState('')
    const router = useRouter()

    useEffect(() => {
        loadTemplates()
    }, [])

    async function loadTemplates() {
        const data = await getNoteTemplates()
        setTemplates(data as NoteTemplate[])
    }

    function applyTemplate(templateId: string) {
        const template = templates.find(t => t.id === templateId)
        if (!template) return

        // Replace variables
        let content = template.content
        const now = new Date()

        const variables: Record<string, string> = {
            patient_name: patientName || '[Nombre del Paciente]',
            patient_age: patientAge?.toString() || '[Edad]',
            date: now.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
            therapist_name: '[Fisioterapeuta]',
            service: '[Servicio]',
            session_number: '1'
        }

        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`\\{${key}\\}`, 'g')
            content = content.replace(regex, value)
        })

        // Apply to appropriate field based on category
        if (template.category === 'diagnosis') {
            setDiagnosis(content)
        } else if (template.category === 'treatment') {
            setTreatmentPlan(content)
        } else {
            setNotes(content)
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        try {
            await createMedicalRecord({
                patient_id: patientId,
                diagnosis: diagnosis,
                treatment_plan: treatmentPlan,
                notes: notes
            })

            // Reset form
            setDiagnosis('')
            setTreatmentPlan('')
            setNotes('')
            setSelectedTemplate('')
            router.refresh()
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
            alert('Error al guardar la consulta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white/50 p-6 rounded-xl border border-white/20 shadow-sm backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Nueva Consulta</h3>

            {templates.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Usar Plantilla (Opcional)</label>
                    <div className="flex gap-2">
                        <select
                            value={selectedTemplate}
                            onChange={(e) => {
                                setSelectedTemplate(e.target.value)
                                if (e.target.value) {
                                    applyTemplate(e.target.value)
                                }
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">Sin plantilla</option>
                            {templates.map(template => (
                                <option key={template.id} value={template.id}>
                                    {template.name} ({template.category})
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => {
                                setDiagnosis('')
                                setTreatmentPlan('')
                                setNotes('')
                                setSelectedTemplate('')
                            }}
                            className="px-3 py-2 border rounded-lg hover:bg-slate-50 text-sm"
                            title="Limpiar todo"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    {selectedTemplate && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Plantilla aplicada - se llenará según categoría
                        </p>
                    )}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico</label>
                <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    rows={3}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border font-mono text-sm"
                    placeholder="Ej. Esguince de tobillo grado 2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan de Tratamiento</label>
                <textarea
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    required
                    rows={4}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border font-mono text-sm"
                    placeholder="Ej. Crioterapia 15min, Ultrasonido, Ejercicios de propiocepción..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas de Evolución / Observaciones</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border font-mono text-sm"
                    placeholder="Detalles adicionales de la sesión..."
                />
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 transition shadow-sm"
                >
                    {loading ? 'Guardando...' : 'Guardar Consulta'}
                </button>
            </div>
        </form>
    )
}

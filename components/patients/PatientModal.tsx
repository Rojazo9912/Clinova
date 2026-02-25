'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPatient, updatePatient } from '@/lib/actions/patients'
import { grantPortalAccess } from '@/lib/actions/patient-portal-access'
import { X, User, Phone, Mail, Calendar, MapPin, Shield, Heart } from 'lucide-react'

interface PatientData {
    id?: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
    birth_date?: string
    gender?: string
    address?: string
    city?: string
    state?: string
    postal_code?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_relationship?: string
    notes?: string
}

interface PatientModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    patient?: PatientData | null
}

export default function PatientModal({ isOpen, onClose, onSuccess, patient }: PatientModalProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const isEditing = !!patient?.id

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const grantAccess = formData.get('grant_portal_access') === 'on'

        const data: PatientData = {
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            email: formData.get('email') as string || undefined,
            phone: formData.get('phone') as string || undefined,
            birth_date: formData.get('birth_date') as string || undefined,
            gender: formData.get('gender') as string || undefined,
            address: formData.get('address') as string || undefined,
            city: formData.get('city') as string || undefined,
            state: formData.get('state') as string || undefined,
            postal_code: formData.get('postal_code') as string || undefined,
            emergency_contact_name: formData.get('emergency_contact_name') as string || undefined,
            emergency_contact_phone: formData.get('emergency_contact_phone') as string || undefined,
            emergency_contact_relationship: formData.get('emergency_contact_relationship') as string || undefined,
            notes: formData.get('notes') as string || undefined,
        }

        try {
            if (isEditing && patient?.id) {
                await updatePatient(patient.id, data)
                onSuccess()
                onClose()
            } else {
                const newPatient = await createPatient(data)
                if (grantAccess && newPatient.email) {
                    await grantPortalAccess(newPatient.id)
                }
                onSuccess()
                onClose()
                router.push(`/dashboard/patients/${newPatient.id}/intake`)
            }
        } catch (err) {
            setError(isEditing ? 'Error al actualizar el paciente.' : 'Error al crear el paciente.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "mt-1 block w-full rounded-lg border border-slate-300 shadow-sm p-2.5 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-bold text-slate-900">
                        {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" id="patient-form">
                        {/* Basic Info */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                                <User className="w-4 h-4 text-blue-600" />
                                Datos Personales
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nombre *</label>
                                    <input name="first_name" required defaultValue={patient?.first_name || ''} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Apellido *</label>
                                    <input name="last_name" required defaultValue={patient?.last_name || ''} className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Fecha Nacimiento</label>
                                    <input type="date" name="birth_date" defaultValue={patient?.birth_date?.split('T')[0] || ''} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Género</label>
                                    <select name="gender" defaultValue={patient?.gender || ''} className={inputClass}>
                                        <option value="">Sin especificar</option>
                                        <option value="masculino">Masculino</option>
                                        <option value="femenino">Femenino</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                                    <input type="tel" name="phone" defaultValue={patient?.phone || ''} className={inputClass} />
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="block text-sm font-medium text-slate-700">Email</label>
                                <input type="email" name="email" defaultValue={patient?.email || ''} className={inputClass} />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                Dirección
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Calle y número</label>
                                <input name="address" defaultValue={patient?.address || ''} className={inputClass} />
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Ciudad</label>
                                    <input name="city" defaultValue={patient?.city || ''} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Estado</label>
                                    <input name="state" defaultValue={patient?.state || ''} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">C.P.</label>
                                    <input name="postal_code" defaultValue={patient?.postal_code || ''} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                                <Shield className="w-4 h-4 text-red-500" />
                                Contacto de Emergencia
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nombre</label>
                                    <input name="emergency_contact_name" defaultValue={patient?.emergency_contact_name || ''} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                                    <input type="tel" name="emergency_contact_phone" defaultValue={patient?.emergency_contact_phone || ''} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Relación</label>
                                    <select name="emergency_contact_relationship" defaultValue={patient?.emergency_contact_relationship || ''} className={inputClass}>
                                        <option value="">Seleccionar</option>
                                        <option value="esposo/a">Esposo/a</option>
                                        <option value="padre/madre">Padre/Madre</option>
                                        <option value="hijo/a">Hijo/a</option>
                                        <option value="hermano/a">Hermano/a</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                                <Heart className="w-4 h-4 text-purple-500" />
                                Notas Clínicas
                            </h3>
                            <textarea
                                name="notes"
                                rows={3}
                                defaultValue={patient?.notes || ''}
                                placeholder="Alergias, condiciones previas, observaciones importantes..."
                                className={inputClass + " resize-none"}
                            />
                        </div>

                        {/* Portal Access (only for new patients) */}
                        {!isEditing && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="grant_portal_access"
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-slate-900">Dar acceso al portal del paciente</span>
                                        <p className="text-xs text-slate-600 mt-0.5">Se enviará un email con las credenciales de acceso</p>
                                    </div>
                                </label>
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="patient-form"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : isEditing ? 'Actualizar Paciente' : 'Guardar Paciente'}
                    </button>
                </div>
            </div>
        </div>
    )
}

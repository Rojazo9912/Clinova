'use client'

import { useState } from 'react'
import { createPatient, updatePatient } from '@/lib/actions/patients'
import { grantPortalAccess } from '@/lib/actions/patient-portal-access'
import { X, User, MapPin, Shield, Heart, ChevronRight } from 'lucide-react'

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
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [mode, setMode] = useState<'quick' | 'full'>('quick')
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
            phone: formData.get('phone') as string || undefined,
            email: formData.get('email') as string || undefined,
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
            } else {
                const newPatient = await createPatient(data)
                if (grantAccess && newPatient.email) {
                    await grantPortalAccess(newPatient.id)
                }
            }
            onSuccess()
            onClose()
        } catch (err) {
            setError(isEditing ? 'Error al actualizar el paciente.' : 'Error al crear el paciente.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "mt-1 block w-full rounded-lg border border-border shadow-sm p-2.5 bg-card text-foreground text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"

    // When editing, always show full form
    const showFull = isEditing || mode === 'full'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">
                            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
                        </h2>
                        {!isEditing && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {mode === 'quick' ? 'Registro rápido — completa el perfil después' : 'Perfil completo'}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Mode toggle — only for new patients */}
                        {!isEditing && (
                            <div className="flex items-center bg-muted rounded-lg p-0.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setMode('quick')}
                                    className={`px-3 py-1.5 rounded-md font-medium transition-all duration-150 ${
                                        mode === 'quick'
                                            ? 'bg-card text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Básico
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('full')}
                                    className={`px-3 py-1.5 rounded-md font-medium transition-all duration-150 ${
                                        mode === 'full'
                                            ? 'bg-card text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Completo
                                </button>
                            </div>
                        )}
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1">
                    {error && (
                        <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} id="patient-form" className="p-6 space-y-5">

                        {/* Always visible: nombre, apellido, teléfono */}
                        <div>
                            {showFull && (
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 mb-3">
                                    <User className="w-3.5 h-3.5 text-blue-500" />
                                    Datos Personales
                                </h3>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nombre *</label>
                                    <input
                                        name="first_name"
                                        required
                                        defaultValue={patient?.first_name || ''}
                                        placeholder="Ej. María"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Apellido *</label>
                                    <input
                                        name="last_name"
                                        required
                                        defaultValue={patient?.last_name || ''}
                                        placeholder="Ej. García"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    defaultValue={patient?.phone || ''}
                                    placeholder="Ej. 555 123 4567"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Full mode extra fields */}
                        {showFull && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground">Email</label>
                                        <input type="email" name="email" defaultValue={patient?.email || ''} placeholder="correo@ejemplo.com" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground">Fecha de Nacimiento</label>
                                        <input type="date" name="birth_date" defaultValue={patient?.birth_date?.split('T')[0] || ''} className={inputClass} />
                                    </div>
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

                                {/* Address */}
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-3">
                                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                        Dirección
                                    </h3>
                                    <input name="address" defaultValue={patient?.address || ''} placeholder="Calle y número" className={inputClass} />
                                    <div className="grid grid-cols-3 gap-3 mt-3">
                                        <input name="city" defaultValue={patient?.city || ''} placeholder="Ciudad" className={inputClass} />
                                        <input name="state" defaultValue={patient?.state || ''} placeholder="Estado" className={inputClass} />
                                        <input name="postal_code" defaultValue={patient?.postal_code || ''} placeholder="C.P." className={inputClass} />
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-3">
                                        <Shield className="w-3.5 h-3.5 text-red-500" />
                                        Contacto de Emergencia
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="emergency_contact_name" defaultValue={patient?.emergency_contact_name || ''} placeholder="Nombre" className={inputClass} />
                                        <input type="tel" name="emergency_contact_phone" defaultValue={patient?.emergency_contact_phone || ''} placeholder="Teléfono" className={inputClass} />
                                    </div>
                                    <select name="emergency_contact_relationship" defaultValue={patient?.emergency_contact_relationship || ''} className={inputClass + " mt-3"}>
                                        <option value="">Relación...</option>
                                        <option value="esposo/a">Esposo/a</option>
                                        <option value="padre/madre">Padre/Madre</option>
                                        <option value="hijo/a">Hijo/a</option>
                                        <option value="hermano/a">Hermano/a</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>

                                {/* Clinical Notes */}
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-3">
                                        <Heart className="w-3.5 h-3.5 text-purple-500" />
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

                                {/* Portal Access */}
                                {!isEditing && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="grant_portal_access"
                                                className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-foreground">Dar acceso al portal del paciente</span>
                                                <p className="text-xs text-muted-foreground mt-0.5">Se enviará un email con las credenciales de acceso</p>
                                            </div>
                                        </label>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Quick mode: hint to switch */}
                        {!showFull && (
                            <button
                                type="button"
                                onClick={() => setMode('full')}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                                Agregar dirección, contacto de emergencia y más
                            </button>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-end gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="patient-form"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar Paciente'}
                    </button>
                </div>
            </div>
        </div>
    )
}

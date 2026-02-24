'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                </>
            ) : (
                'Crear Usuario'
            )}
        </button>
    )
}

export default function CreateClinicUserForm({ clinicId, createAction }: { clinicId: string, createAction: any }) {
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    async function clientAction(formData: FormData) {
        setMessage(null)
        // Add clinicId to formData
        const result = await createAction(null, formData)

        if (result.message) {
            setMessage({
                text: result.message,
                type: result.success ? 'success' : 'error'
            })

            if (result.success) {
                // Reset form
                const form = document.querySelector('form') as HTMLFormElement
                form?.reset()
            }
        }
    }

    return (
        <form action={clientAction} className="space-y-4">
            {message && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.text}
                </div>
            )}

            <input type="hidden" name="clinic_id" value={clinicId} />
            <div className="text-xs text-gray-400">Debug Clinic ID: {clinicId || 'UNDEFINED'}</div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                    type="text"
                    name="full_name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    name="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                    type="tel"
                    name="phone"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select
                    name="role"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    defaultValue="clinic_manager"
                >
                    <option value="clinic_manager">Gerente de Clínica</option>
                    <option value="staff">Personal Administrativo</option>
                </select>
            </div>

            <SubmitButton />
        </form>
    )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Building2, Globe } from 'lucide-react'
import { setupNewClinic } from '@/lib/actions/onboarding'

export default function OnboardingPage() {
    const router = useRouter()
    
    const [clinicName, setClinicName] = useState('')
    const [clinicSlug, setClinicSlug] = useState('')
    const [autoSlug, setAutoSlug] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Helper to generate slug
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value
        setClinicName(newName)

        if (autoSlug) {
            setClinicSlug(generateSlug(newName))
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClinicSlug(e.target.value)
        setAutoSlug(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        try {
            const formData = new FormData()
            formData.append('clinicName', clinicName)
            formData.append('clinicSlug', clinicSlug)

            const result = await setupNewClinic(formData)
            
            if (result.success) {
                router.push('/dashboard')
            }
        } catch (err: any) {
            setError(err.message || 'Error al completar el registro. Intenta de nuevo.')
            setLoading(false)
        }
    }

    return (
        <div className="bg-card rounded-2xl p-8 border border-border shadow-xl shadow-blue-500/5">
            <div className="space-y-2 mb-8 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Configura tu Clínica</h1>
                <p className="text-muted-foreground text-sm">
                    Estás a un paso de comenzar. Danos los datos básicos de tu espacio de trabajo.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg flex items-start gap-3">
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2" htmlFor="clinicName">
                        Nombre de la Clínica
                    </label>
                    <input
                        id="clinicName"
                        type="text"
                        value={clinicName}
                        onChange={handleNameChange}
                        required
                        className="w-full rounded-lg border border-input bg-background text-foreground px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej. Fisioterapia Integra"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2" htmlFor="clinicSlug">
                        Identificador web (URL)
                    </label>
                    <div className="relative flex items-center">
                        <span className="absolute left-4 text-muted-foreground">
                            <Globe className="w-4 h-4" />
                        </span>
                        <input
                            id="clinicSlug"
                            type="text"
                            value={clinicSlug}
                            onChange={handleSlugChange}
                            required
                            className="w-full rounded-lg border border-input bg-background pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="fisioterapia-integra"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                        app.axomed.mx/<span className="text-foreground font-semibold">{clinicSlug || 'fisioterapia-integra'}</span>
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || !clinicName || !clinicSlug}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center shadow-lg shadow-blue-600/20"
                >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Finalizar y Entrar'}
                </button>
            </form>
        </div>
    )
}

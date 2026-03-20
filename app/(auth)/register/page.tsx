'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()
    
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            })

            if (signUpError) throw signUpError

            // Supabase by default will log the user in if email confirmations are off
            // or we just redirect them to dashboard. Middleware/Layout will catch them if they have no clinic.
            router.push('/dashboard')
            router.refresh()
            
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass rounded-xl p-8 space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter text-blue-600 dark:text-blue-400">AxoMed</h1>
                <p className="text-muted-foreground">Crea tu cuenta para registrar tu clínica</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="fullName">Nombre Completo</label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full rounded-md border bg-card/50 text-foreground px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dra. Ana López"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email">Correo Electrónico</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-md border bg-card/50 text-foreground px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ana.lopez@clinica.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-md border bg-card/50 text-foreground px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Crear Cuenta'}
                </button>
            </form>

            <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-center text-muted-foreground">
                    ¿Ya tienes una cuenta o clínica?{' '}
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline transition">
                        Inicia sesión aquí
                    </Link>
                </p>

                <p className="text-xs text-center text-muted-foreground mt-4">
                    Al registrarte aceptas nuestros{' '}
                    <Link href="/terminos" className="underline hover:text-foreground transition" target="_blank">Términos de Uso</Link>
                    {' '}y{' '}
                    <Link href="/privacidad" className="underline hover:text-foreground transition" target="_blank">Aviso de Privacidad</Link>.
                </p>
            </div>
        </div>
    )
}

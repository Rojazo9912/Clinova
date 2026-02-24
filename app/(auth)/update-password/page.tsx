'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function UpdatePasswordPage() {
    const router = useRouter()
    const supabase = createClient()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [sessionReady, setSessionReady] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event, 'Session:', !!session)
            if (event === 'SIGNED_IN' && session) {
                setSessionReady(true)
                setCheckingSession(false)
            }
            if (event === 'INITIAL_SESSION') {
                // If INITIAL_SESSION has a session, we're good
                if (session) {
                    setSessionReady(true)
                }
                // Give time for hash fragment processing
                setTimeout(() => setCheckingSession(false), 3000)
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (checkingSession) {
        return (
            <div className="flex items-center justify-center mt-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-slate-600">Verificando invitación...</span>
            </div>
        )
    }

    if (!sessionReady) {
        return (
            <div className="glass rounded-xl p-8 space-y-6 w-full max-w-md mx-auto mt-20">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Enlace inválido o expirado</h1>
                    <p className="text-muted-foreground">
                        El enlace de invitación ha expirado o ya fue utilizado. Contacta al administrador para recibir una nueva invitación.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="glass rounded-xl p-8 space-y-6 w-full max-w-md mx-auto mt-20">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter text-blue-600 dark:text-blue-400">Establecer Contraseña</h1>
                <p className="text-muted-foreground">Ingresa tu nueva contraseña para acceder a tu cuenta.</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-sm p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="password">Nueva Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-md border bg-white/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="confirmPassword">Confirmar Contraseña</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full rounded-md border bg-white/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Guardar y Entrar'}
                </button>
            </form>
        </div>
    )
}

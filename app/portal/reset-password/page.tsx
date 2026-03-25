'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState('')
    const [ready, setReady] = useState(false)
    const router = useRouter()

    // Supabase redirects with a hash fragment containing the token.
    // We need to wait for the auth session to be established from the URL hash.
    useEffect(() => {
        const supabase = createClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setReady(true)
            }
        })
        return () => subscription.unsubscribe()
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (password !== confirm) {
            setError('Las contraseñas no coinciden')
            return
        }
        if (password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres')
            return
        }

        setLoading(true)
        setError('')

        const supabase = createClient()
        const { error: updateError } = await supabase.auth.updateUser({ password })

        setLoading(false)

        if (updateError) {
            setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
            return
        }

        setDone(true)
        setTimeout(() => router.push('/portal/login'), 3000)
    }

    if (!ready) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Verificando enlace...</h1>
                    <p className="text-muted-foreground text-sm">
                        Si este mensaje no desaparece, el enlace puede haber expirado.{' '}
                        <Link href="/portal/forgot-password" className="text-blue-600 hover:underline">
                            Solicita uno nuevo
                        </Link>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Nueva contraseña</h1>
                    <p className="text-muted-foreground mt-2">Elige una contraseña segura para tu cuenta</p>
                </div>

                <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
                    {done ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                            </div>
                            <p className="text-foreground font-medium">¡Contraseña actualizada!</p>
                            <p className="text-sm text-muted-foreground">
                                Serás redirigido al inicio de sesión en unos segundos...
                            </p>
                            <Link
                                href="/portal/login"
                                className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                            >
                                Ir al login ahora
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        autoFocus
                                        minLength={8}
                                        className="w-full px-4 py-3 pr-11 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Confirmar contraseña
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
                                    placeholder="Repite la contraseña"
                                />
                            </div>

                            {/* Password strength indicator */}
                            {password.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className="h-1 flex-1 rounded-full transition-all"
                                                style={{
                                                    background: password.length >= i * 3
                                                        ? i <= 1 ? '#ef4444' : i <= 2 ? '#f97316' : i <= 3 ? '#eab308' : '#22c55e'
                                                        : 'var(--border)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {password.length < 4 ? 'Muy corta' : password.length < 7 ? 'Débil' : password.length < 10 ? 'Regular' : 'Fuerte'}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

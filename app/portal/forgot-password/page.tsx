'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const supabase = createClient()
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/portal/reset-password`,
        })

        setLoading(false)

        if (resetError) {
            setError('No se pudo enviar el correo. Verifica que el email sea correcto.')
            return
        }

        setSent(true)
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Recuperar contraseña</h1>
                    <p className="text-muted-foreground mt-2">
                        {sent ? 'Revisa tu correo electrónico' : 'Te enviaremos un enlace para restablecer tu contraseña'}
                    </p>
                </div>

                <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
                    {sent ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                            </div>
                            <p className="text-foreground font-medium">
                                Enviamos un enlace a <span className="text-blue-600">{email}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Revisa tu bandeja de entrada y sigue las instrucciones. El enlace expira en 60 minutos.
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">
                                ¿No llegó? Revisa tu carpeta de spam o{' '}
                                <button
                                    onClick={() => { setSent(false); setEmail('') }}
                                    className="text-blue-600 hover:underline"
                                >
                                    intenta de nuevo
                                </button>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href="/portal/login"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}

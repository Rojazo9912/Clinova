'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        const supabase = createClient()

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/portal/reset-password`
            })

            if (resetError) {
                setError('Hubo un error al intentar enviar el enlace de recuperación. Verifica el correo e intenta nuevamente.')
                return
            }

            setSuccess(true)

        } catch (err) {
            console.error('Reset password error:', err)
            setError('Ocurrió un error inesperado al procesar la solicitud.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Recuperar Contraseña</h1>
                    <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
                        Ingresa el correo electrónico asociado a tu cuenta de paciente para recibir un enlace de recuperación.
                    </p>
                </div>

                {/* Reset Card */}
                <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Correo enviado</h3>
                            <p className="text-sm text-muted-foreground">
                                Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Por favor, revisa tu bandeja de entrada o carpeta de spam.
                            </p>
                            <Link href="/portal/login" className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
                                    placeholder="paciente@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : 'Enviar enlace'}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/portal/login"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Recordé mi contraseña. Volver atrás
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

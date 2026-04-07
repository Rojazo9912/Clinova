'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')
        
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

        const supabase = createClient()

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            })

            if (updateError) {
                setError('Hubo un error al actualizar la contraseña. Tu sesión de recuperación podría haber expirado.')
                return
            }

            setSuccess(true)
            
            // Redirect after a few seconds
            setTimeout(() => {
                router.push('/portal/dashboard')
            }, 3000)

        } catch (err) {
            console.error('Update password error:', err)
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Crear nueva contraseña</h1>
                    <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
                        Establece tu nueva contraseña de acceso para el portal.
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
                            <h3 className="text-lg font-bold text-foreground">Contraseña actualizada</h3>
                            <p className="text-sm text-muted-foreground">
                                Tu contraseña ha sido cambiada de forma segura. Redirigiendo al portal...
                            </p>
                            <Link href="/portal/dashboard" className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Ir al portal ahora
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Guardando...' : 'Cambiar contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

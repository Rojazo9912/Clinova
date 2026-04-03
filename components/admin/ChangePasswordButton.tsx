'use client'

import { useState } from 'react'
import { KeyRound, X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { changeUserPassword } from '@/lib/actions/admin'

interface Props {
    userId: string
    userName: string
}

export default function ChangePasswordButton({ userId, userName }: Props) {
    const [open, setOpen] = useState(false)
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (password !== confirm) {
            setError('Las contraseñas no coinciden')
            return
        }

        setLoading(true)
        const result = await changeUserPassword(userId, password)
        setLoading(false)

        if ('error' in result) {
            setError(result.error ?? 'Error desconocido')
        } else {
            setSuccess(true)
            setTimeout(() => {
                setOpen(false)
                setSuccess(false)
                setPassword('')
                setConfirm('')
            }, 1500)
        }
    }

    return (
        <>
            <button
                onClick={() => { setOpen(true); setError(null); setSuccess(false) }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                title="Cambiar contraseña"
            >
                <KeyRound className="w-3.5 h-3.5" />
                Contraseña
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold">Cambiar contraseña</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{userName}</p>
                            </div>
                            <button
                                onClick={() => { setOpen(false); setPassword(''); setConfirm(''); setError(null) }}
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {success ? (
                            <div className="py-4 text-center text-green-600 font-semibold text-sm">
                                ✓ Contraseña actualizada
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Nueva contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={show ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            required
                                            minLength={8}
                                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShow(!show)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        >
                                            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Confirmar contraseña</label>
                                    <input
                                        type={show ? 'text' : 'password'}
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="Repite la contraseña"
                                        required
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs text-destructive">{error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {loading ? 'Guardando...' : 'Cambiar contraseña'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

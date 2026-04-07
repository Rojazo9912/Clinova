'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, LogOut, Monitor, Smartphone, Globe, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SessionInfo {
    id: string
    created_at: string
    updated_at: string
    user_agent: string | null
    ip: string | null
}

function getDeviceIcon(ua: string | null) {
    if (!ua) return Globe
    const lower = ua.toLowerCase()
    if (/mobile|android|iphone|ipad/.test(lower)) return Smartphone
    return Monitor
}

function getDeviceLabel(ua: string | null): string {
    if (!ua) return 'Dispositivo desconocido'
    if (/iphone/i.test(ua)) return 'iPhone'
    if (/ipad/i.test(ua)) return 'iPad'
    if (/android/i.test(ua)) return 'Android'
    if (/mac/i.test(ua)) return 'Mac'
    if (/windows/i.test(ua)) return 'Windows'
    if (/linux/i.test(ua)) return 'Linux'
    return 'Navegador web'
}

function getBrowserLabel(ua: string | null): string {
    if (!ua) return ''
    if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome'
    if (/firefox/i.test(ua)) return 'Firefox'
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari'
    if (/edg/i.test(ua)) return 'Edge'
    return 'Navegador'
}

export default function SecurityPage() {
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [signingOut, setSigningOut] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            setLoading(false)
        }
        load()
    }, [])

    async function handleSignOutAll() {
        if (!confirm('¿Cerrar sesión en todos los dispositivos? Tendrás que volver a iniciar sesión.')) return
        setSigningOut(true)
        const { error } = await supabase.auth.signOut({ scope: 'global' })
        if (error) {
            toast.error('Error al cerrar sesión')
            setSigningOut(false)
        } else {
            toast.success('Sesión cerrada en todos los dispositivos')
            router.push('/portal/login')
        }
    }

    async function handleSignOut() {
        setSigningOut(true)
        await supabase.auth.signOut()
        router.push('/portal/login')
    }

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : null
    const DeviceIcon = getDeviceIcon(ua)

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
                <div className="h-40 w-full bg-muted rounded-xl animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Shield className="w-7 h-7 text-blue-600" />
                    Seguridad
                </h1>
                <p className="text-muted-foreground mt-2">Gestiona el acceso a tu cuenta</p>
            </div>

            {/* Current Session */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Sesión Activa</h2>
                    <p className="text-sm text-muted-foreground">Dispositivo donde estás conectado ahora</p>
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <DeviceIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">{getDeviceLabel(ua)}</p>
                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    Activa
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {getBrowserLabel(ua)}
                                {session?.user?.email && ` · ${session.user.email}`}
                            </p>
                            {session?.expires_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Expira {formatDistanceToNow(new Date(session.expires_at * 1000), { addSuffix: true, locale: es })}
                                </p>
                            )}
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Información de Cuenta</h2>
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-sm font-medium text-foreground">{session?.user?.email || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Cuenta creada</span>
                        <span className="text-sm font-medium text-foreground">
                            {session?.user?.created_at
                                ? format(new Date(session.user.created_at), "d 'de' MMMM yyyy", { locale: es })
                                : '—'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Último acceso</span>
                        <span className="text-sm font-medium text-foreground">
                            {session?.user?.last_sign_in_at
                                ? formatDistanceToNow(new Date(session.user.last_sign_in_at), { addSuffix: true, locale: es })
                                : '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground">Acciones de Sesión</h2>
                </div>
                <div className="p-6 space-y-3">
                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted transition group"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition" />
                            <div className="text-left">
                                <p className="font-medium text-sm text-foreground">Cerrar sesión</p>
                                <p className="text-xs text-muted-foreground">Solo en este dispositivo</p>
                            </div>
                        </div>
                        {signingOut && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    </button>

                    <button
                        onClick={handleSignOutAll}
                        disabled={signingOut}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/10 transition group"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <div className="text-left">
                                <p className="font-medium text-sm text-red-600 dark:text-red-400">Cerrar todas las sesiones</p>
                                <p className="text-xs text-muted-foreground">Se cerrará sesión en todos tus dispositivos</p>
                            </div>
                        </div>
                        {signingOut && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                    </button>
                </div>
            </div>
        </div>
    )
}

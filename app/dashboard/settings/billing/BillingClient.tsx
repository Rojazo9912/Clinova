'use client'

import { useState } from 'react'
import { Check, CreditCard, AlertTriangle, ShieldCheck, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ClinicSubscription } from '@/lib/actions/subscription'

interface Props {
    subscription: ClinicSubscription
    showSuccess: boolean
    showCanceled: boolean
}

export default function BillingClient({ subscription, showSuccess, showCanceled }: Props) {
    const [loading, setLoading] = useState(false)
    const [managingLoading, setManagingLoading] = useState(false)
    const isActive = subscription.status === 'active'

    const renewalDate = subscription.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : null

    async function handleSubscribe() {
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', { method: 'POST' })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                toast.error('Error al iniciar pago')
            }
        } catch {
            toast.error('Error al conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    async function handleManage() {
        setManagingLoading(true)
        try {
            const res = await fetch('/api/stripe/portal', { method: 'POST' })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                toast.error('Error al abrir el portal')
            }
        } catch {
            toast.error('Error al conectar con el servidor')
        } finally {
            setManagingLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Facturación y Planes</h1>
                <p className="text-muted-foreground mt-2">Gestiona tu suscripción y métodos de pago.</p>
            </div>

            {showSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 p-4 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">¡Pago exitoso!</p>
                        <p className="text-sm">Tu suscripción está activa. Gracias por confiar en AxoMed.</p>
                    </div>
                </div>
            )}

            {showCanceled && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Pago cancelado</p>
                        <p className="text-sm">No se ha realizado ningún cobro. Puedes intentarlo nuevamente cuando desees.</p>
                    </div>
                </div>
            )}

            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                {/* Plan header */}
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Plan Actual</h2>
                        <div className="mt-1.5 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isActive
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                    : 'bg-muted text-muted-foreground'
                            }`}>
                                {isActive ? '✓ Pro — Activo' : 'Gratuito'}
                            </span>
                            {isActive && renewalDate && (
                                <span className="text-xs text-muted-foreground">
                                    Próxima renovación: {renewalDate}
                                </span>
                            )}
                        </div>
                    </div>
                    {isActive && (
                        <button
                            onClick={handleManage}
                            disabled={managingLoading}
                            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        >
                            <Settings2 className="h-4 w-4" />
                            {managingLoading ? 'Abriendo...' : 'Administrar suscripción'}
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {!isActive ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Free plan */}
                            <div className="p-6 rounded-xl border-2 border-border">
                                <h3 className="font-bold text-lg text-foreground">Plan Gratuito</h3>
                                <p className="text-3xl font-bold text-foreground mt-2">
                                    $0 <span className="text-sm font-normal text-muted-foreground">/mes</span>
                                </p>
                                <ul className="mt-6 space-y-3">
                                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-green-500" /> 1 Clínica</li>
                                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-green-500" /> Hasta 50 Citas/mes</li>
                                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-green-500" /> Pacientes limitados</li>
                                </ul>
                                <button disabled className="mt-6 w-full py-2 bg-muted text-muted-foreground rounded-xl font-medium cursor-not-allowed text-sm">
                                    Plan Actual
                                </button>
                            </div>

                            {/* Pro plan */}
                            <div className="p-6 rounded-xl border-2 border-blue-600 bg-blue-50/10 dark:bg-blue-900/10 shadow-lg relative">
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                                    RECOMENDADO
                                </div>
                                <h3 className="font-bold text-lg text-foreground">Plan Pro</h3>
                                <p className="text-3xl font-bold text-foreground mt-2">
                                    $999 <span className="text-sm font-normal text-muted-foreground">/mes</span>
                                </p>
                                <ul className="mt-6 space-y-3">
                                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-blue-600" /> Clínicas Ilimitadas</li>
                                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-blue-600" /> Citas Ilimitadas</li>
                                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-blue-600" /> Notificaciones WhatsApp</li>
                                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-blue-600" /> Soporte Prioritario</li>
                                </ul>
                                <button
                                    onClick={handleSubscribe}
                                    disabled={loading}
                                    className="mt-6 w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md flex justify-center items-center gap-2 text-sm disabled:opacity-70"
                                >
                                    {loading ? 'Procesando...' : <><CreditCard className="h-4 w-4" /> Mejorar ahora</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-foreground">¡Eres miembro Pro!</h3>
                            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                Tienes acceso ilimitado a todas las funciones de AxoMed.
                                {renewalDate && ` Tu próxima facturación es el ${renewalDate}.`}
                            </p>
                            <button
                                onClick={handleManage}
                                disabled={managingLoading}
                                className="mt-6 px-6 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50"
                            >
                                {managingLoading ? 'Abriendo...' : 'Gestionar tarjeta y facturas'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

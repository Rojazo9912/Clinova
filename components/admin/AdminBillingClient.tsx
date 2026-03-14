'use client'

import { useState } from 'react'
import { CreditCard, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    clinicId: string
    isActive: boolean
    subscriptionId: string | null
    renewalDate: string | null
}

export default function AdminBillingClient({ clinicId, isActive, subscriptionId, renewalDate }: Props) {
    const [loading, setLoading] = useState(false)
    const [managingLoading, setManagingLoading] = useState(false)

    async function handleSubscribe() {
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clinicId }),
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                toast.error(data.error || 'Error al iniciar pago')
            }
        } catch (err) {
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
                toast.error(data.error || 'Error al abrir el portal')
            }
        } catch (err) {
            toast.error('Error al conectar con el servidor')
        } finally {
            setManagingLoading(false)
        }
    }

    return (
        <div className={`p-6 border rounded-xl shadow-sm space-y-4 ${isActive ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-card border-border'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Estado de Suscripción (Admin)
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona el pago de esta clínica en Stripe.
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                    {isActive ? '✓ PRO - ACTIVO' : 'INACTIVO'}
                </span>
            </div>

            <div className="pt-4 border-t">
                {isActive ? (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Suscripción gestionada por ti.</p>
                            {renewalDate && <p className="text-xs text-muted-foreground">Próximo cobro: {new Date(renewalDate).toLocaleDateString()}</p>}
                        </div>
                        <button
                            onClick={handleManage}
                            disabled={managingLoading}
                            className="px-4 py-2 bg-white border shadow-sm text-sm font-medium rounded-lg hover:bg-muted transition"
                        >
                            {managingLoading ? 'Abriendo...' : 'Gestionar Pagos en Stripe'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">La clínica no tiene una suscripción activa.</p>
                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white shadow-sm text-sm font-bold rounded-lg hover:bg-blue-700 transition"
                        >
                            {loading ? 'Redirigiendo...' : 'Pagar Suscripción'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

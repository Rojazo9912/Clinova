'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, CreditCard, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function BillingPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    // In a real app, we fetch this from server/DB
    // For now, we simulate "No Plan" state unless success param is present
    const isSuccess = searchParams.get('success') === 'true'
    const isCanceled = searchParams.get('canceled') === 'true'

    // Ideally, we check real DB status here or passing it as prop
    const status = isSuccess ? 'active' : 'inactive'

    async function handleSubscribe() {
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert('Error al iniciar pago')
            }
        } catch (error) {
            console.error(error)
            alert('Error al conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Facturación y Planes</h1>
                <p className="text-slate-500 mt-2">Gestiona tu suscripción y métodos de pago.</p>
            </div>

            {isSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <ShieldCheck className="h-5 w-5" />
                    <div>
                        <p className="font-medium">¡Pago exitoso!</p>
                        <p className="text-sm">Tu suscripción está activa. Gracias por confiar en Clinova.</p>
                    </div>
                </div>
            )}

            {isCanceled && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                        <p className="font-medium">Pago cancelado</p>
                        <p className="text-sm">No se ha realizado ningún cobro. Puedes intentarlo nuevamente cuando desees.</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Plan Actual</h2>
                        <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                {status === 'active' ? 'Pro' : 'Gratuito'}
                            </span>
                        </div>
                    </div>
                    {status === 'active' && (
                        <button className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                            Administrar suscripción
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {status === 'inactive' ? (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-xl border-2 border-slate-100 hover:border-blue-100 transition duration-200">
                                    <h3 className="font-bold text-lg text-slate-900">Plan Gratuito</h3>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">$0 <span className="text-sm font-normal text-slate-500">/mes</span></p>
                                    <ul className="mt-6 space-y-3">
                                        <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500" /> 1 Clínica</li>
                                        <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500" /> Hasta 50 Citas/mes</li>
                                        <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500" /> Pacientes limitados</li>
                                    </ul>
                                    <button disabled className="mt-6 w-full py-2 bg-slate-100 text-slate-400 rounded-lg font-medium cursor-not-allowed">
                                        Plan Actual
                                    </button>
                                </div>

                                <div className="p-6 rounded-xl border-2 border-blue-600 bg-blue-50/10 shadow-lg relative">
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                                        RECOMENDADO
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900">Plan Pro</h3>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">$999 <span className="text-sm font-normal text-slate-500">/mes</span></p>
                                    <ul className="mt-6 space-y-3">
                                        <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-blue-600" /> Clínicas Ilimitadas</li>
                                        <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-blue-600" /> Citas Ilimitadas</li>
                                        <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-blue-600" /> Notificaciones WhatsApp</li>
                                        <li className="flex items-center gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-blue-600" /> Soporte Prioritario</li>
                                    </ul>
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={loading}
                                        className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md flex justify-center items-center gap-2"
                                    >
                                        {loading ? 'Procesando...' : <><CreditCard className="h-4 w-4" /> Mejorar ahora</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900">¡Eres miembro Pro!</h3>
                            <p className="text-slate-600 mt-2 max-w-md mx-auto">
                                Tienes acceso ilimitado a todas las funciones de Clinova. Tu próxima facturación es el 1 de Marzo.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { testNotificationSetup } from '@/lib/actions/notifications'

export default function NotificationSettings() {
    const [config, setConfig] = useState<{
        whatsapp: boolean
        email: boolean
        configured: boolean
    } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkConfig() {
            try {
                const result = await testNotificationSetup()
                setConfig(result)
            } catch (error) {
                console.error('Error checking notification config:', error)
            } finally {
                setLoading(false)
            }
        }
        checkConfig()
    }, [])

    if (loading) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Notificaciones</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Notificaciones</h3>
            </div>

            <div className="space-y-4">
                {/* WhatsApp Status */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="font-medium">WhatsApp</p>
                            <p className="text-sm text-muted-foreground">
                                Recordatorios por WhatsApp
                            </p>
                        </div>
                    </div>
                    {config?.whatsapp ? (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Configurado</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <XCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">No configurado</span>
                        </div>
                    )}
                </div>

                {/* Email Status */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">
                                Confirmaciones y recibos por email
                            </p>
                        </div>
                    </div>
                    {config?.email ? (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">Configurado</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <XCircle className="h-5 w-5" />
                            <span className="text-sm font-medium">No configurado</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                {!config?.configured && (
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                            <strong>Configuración requerida:</strong> Agrega las credenciales de Twilio y Resend en tu archivo <code className="px-1 py-0.5 bg-yellow-100 rounded">.env.local</code> para habilitar las notificaciones.
                        </p>
                    </div>
                )}

                {config?.configured && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm text-green-800">
                            ✅ Sistema de notificaciones activo. Los recordatorios se envían automáticamente 24 horas antes de cada cita.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

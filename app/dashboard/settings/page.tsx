import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch clinic details directly or via profile relation
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, clinic_id, gcal_refresh_token, clinics(*)')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) {
        return (
            <div className="p-8">
                <div className="glass p-6 text-center">
                    <h2 className="text-xl font-bold text-red-500">Sin Clínica Asignada</h2>
                    <p>Contacta al soporte para configurar tu clínica.</p>
                </div>
            </div>
        )
    }

    const clinic = profile.clinics as any
    const isGoogleCalendarConnected = !!profile?.gcal_refresh_token

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Configuración de Clínica</h2>
                <p className="text-muted-foreground">Gestiona los detalles generales y apariencia.</p>
            </div>

            <div className="glass p-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Read-only for now, later make editable forms */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre de la Clínica</label>
                        <input
                            type="text"
                            readOnly
                            value={clinic?.name || ''}
                            className="w-full p-2 rounded-md border bg-slate-100 dark:bg-slate-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subdominio (Slug)</label>
                        <input
                            type="text"
                            readOnly
                            value={clinic?.slug || ''}
                            className="w-full p-2 rounded-md border bg-slate-100 dark:bg-slate-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">ID de Suscripción</label>
                        <div className="p-2 rounded-md border bg-slate-100 dark:bg-slate-800 font-mono text-xs">
                            {clinic?.subscription_status || 'N/A'}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-md opacity-50 cursor-not-allowed">
                        Guardar Cambios (Próximamente)
                    </button>
                </div>
            </div>

            <div className="glass p-8 space-y-6">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Integraciones Personales</h3>
                    <p className="text-sm text-slate-500">Conecta tus cuentas para habilitar funcionalidades automáticas.</p>
                </div>

                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                            <span className="text-xl">📅</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900">Google Calendar</h4>
                            <p className="text-xs text-slate-500">
                                {isGoogleCalendarConnected
                                    ? 'Tu cuenta está conectada de forma segura para sincronización.'
                                    : 'Conecta tu cuenta para sincronizar las citas de Clinova con tu agenda.'}
                            </p>
                        </div>
                    </div>

                    {isGoogleCalendarConnected ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Conectado
                            </span>
                            <form action="/api/calendar/disconnect" method="POST">
                                <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline px-2 py-1">
                                    Desconectar
                                </button>
                            </form>
                        </div>
                    ) : (
                        <a
                            href="/api/calendar/auth"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition"
                        >
                            Conectar Cuenta
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

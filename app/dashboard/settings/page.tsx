import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch clinic details directly or via profile relation
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, clinic_id, clinics(*)')
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
        </div>
    )
}

'use client'

import { Home, Calendar, FileText, Activity, Settings, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
    { label: 'Panel de Control', icon: Home, href: '/portal/dashboard' },
    { label: 'Mis Citas', icon: Calendar, href: '/portal/appointments' },
    { label: 'Expediente Médico', icon: FileText, href: '/portal/medical-records' },
    { label: 'Mis Ejercicios', icon: Activity, href: '/portal/exercises' },
    { label: 'Configuración', icon: Settings, href: '/portal/settings' }
]

export default function PortalSidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden sm:flex flex-col w-64 h-[calc(100vh-64px)] fixed top-16 left-0 border-r border-border bg-card p-4 overflow-y-auto">
            <div className="space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link 
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between p-3 rounded-xl transition group ${
                                isActive 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                                <span className="text-sm font-semibold">{item.label}</span>
                            </div>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />}
                        </Link>
                    )
                })}
            </div>
            
            <div className="mt-auto pt-8">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Ayuda</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed mb-3">
                        ¿Tienes dudas sobre tu tratamiento? Contacta a tu clínica.
                    </p>
                    <button className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                        Soporte Técnico <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </aside>
    )
}

'use client'

import { Home, Calendar, FileText, Activity, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
    { label: 'Inicio', icon: Home, href: '/portal/dashboard' },
    { label: 'Citas', icon: Calendar, href: '/portal/appointments' },
    { label: 'Expediente', icon: FileText, href: '/portal/medical-records' },
    { label: 'Ejercicios', icon: Activity, href: '/portal/exercises' },
    { label: 'Perfil', icon: Settings, href: '/portal/settings' }
]

export default function PortalBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border sm:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link 
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                                isActive ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-[10px] font-medium mt-1 uppercase tracking-tight">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

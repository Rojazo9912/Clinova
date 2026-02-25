'use client'

import Link from 'next/link'

import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    FileText,
    Activity,
    LogOut,
    Shield,
    Dumbbell,
    Copy
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions'
import { useRouter, usePathname } from 'next/navigation'

interface DashboardSidebarProps {

    permissions?: string[]
}

const routes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        active: (pathname: string) => pathname === '/dashboard',
        permission: PERMISSIONS.VIEW_DASHBOARD,
    },
    {
        label: 'Agenda',
        icon: Calendar,
        href: '/dashboard/agenda',
        active: (pathname: string) => pathname.startsWith('/dashboard/agenda'),
        permission: PERMISSIONS.VIEW_AGENDA,
    },
    {
        label: 'Pacientes',
        icon: Users,
        href: '/dashboard/patients',
        active: (pathname: string) => pathname.startsWith('/dashboard/patients'),
        permission: PERMISSIONS.VIEW_PATIENTS,
    },
    {
        label: 'Fisioterapeutas',
        icon: Activity,
        href: '/dashboard/physiotherapists',
        active: (pathname: string) => pathname.startsWith('/dashboard/physiotherapists'),
        permission: PERMISSIONS.VIEW_PHYSIOS,
    },
    {
        label: 'Usuarios',
        icon: Shield,
        href: '/dashboard/users',
        active: (pathname: string) => pathname.startsWith('/dashboard/users'),
        permission: PERMISSIONS.VIEW_USERS,
    },
    {
        label: 'Expedientes',
        icon: FileText,
        href: '/dashboard/emr',
        active: (pathname: string) => pathname.startsWith('/dashboard/emr'),
        permission: PERMISSIONS.VIEW_EMR,
    },
    {
        label: 'Finanzas',
        icon: FileText,
        href: '/dashboard/finance',
        active: (pathname: string) => pathname.startsWith('/dashboard/finance'),
        permission: PERMISSIONS.VIEW_FINANCE,
    },
    {
        label: 'Ejercicios',
        icon: Dumbbell,
        href: '/dashboard/exercises',
        active: (pathname: string) => pathname.startsWith('/dashboard/exercises'),
        permission: PERMISSIONS.VIEW_EXERCISES,
    },
    {
        label: 'Plantillas',
        icon: Copy,
        href: '/dashboard/templates',
        active: (pathname: string) => pathname.startsWith('/dashboard/templates'),
        permission: PERMISSIONS.VIEW_TEMPLATES,
    },
    {
        label: 'Configuración',
        icon: Settings,
        href: '/dashboard/settings',
        active: (pathname: string) => pathname.startsWith('/dashboard/settings'),
        permission: PERMISSIONS.VIEW_SETTINGS,
    },
]

export function DashboardSidebar({ permissions = [] }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#0F172A] text-white border-r border-white/5 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none" />

            <div className="px-6 py-4 flex-1 z-10 overflow-y-auto overflow-x-hidden">
                <Link href="/dashboard" className="flex items-center gap-2 mb-10 group">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300">
                        <span className="font-bold text-white text-lg">C</span>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
                        Clinova
                    </h1>
                </Link>

                <div className="space-y-2">
                    {routes
                        .filter(route => hasPermission(permissions, route.permission))
                        .map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200 relative overflow-hidden",
                                    route.active(pathname)
                                        ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/10"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {route.active(pathname) && (
                                    <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-full" />
                                )}
                                <div className="flex items-center flex-1 z-10">
                                    <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.active(pathname) ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                                    {route.label}
                                </div>
                            </Link>
                        ))}

                    {hasPermission(permissions, PERMISSIONS.MANAGE_ROLES) && (
                        <Link
                            href="/dashboard/admin"
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200 relative overflow-hidden",
                                pathname.startsWith('/dashboard/admin')
                                    ? "bg-gradient-to-r from-red-600/20 to-orange-600/20 text-red-400 border border-red-500/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {pathname.startsWith('/dashboard/admin') && (
                                <div className="absolute left-0 top-0 h-full w-1 bg-red-500 rounded-r-full" />
                            )}
                            <div className="flex items-center flex-1 z-10">
                                <Shield className={cn("h-5 w-5 mr-3 transition-colors", pathname.startsWith('/dashboard/admin') ? "text-red-400" : "text-slate-500 group-hover:text-red-400")} />
                                Super Admin
                            </div>
                        </Link>
                    )}
                </div>
            </div>

            <div className="px-6 py-4 z-10">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    )
}

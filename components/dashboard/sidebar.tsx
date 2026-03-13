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
    Copy,
    PanelLeftClose,
    PanelLeftOpen,
    DollarSign,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions'
import { useRouter, usePathname } from 'next/navigation'
import { useSidebar } from '@/lib/contexts/sidebar-context'

interface DashboardSidebarProps {
    permissions?: string[]
    userInitials?: string
    userName?: string
}

const routes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        active: (p: string) => p === '/dashboard',
        permission: PERMISSIONS.VIEW_DASHBOARD,
        iconColor: 'text-blue-500',
        activeBg: 'bg-blue-50',
        activeText: 'text-blue-700',
    },
    {
        label: 'Agenda',
        icon: Calendar,
        href: '/dashboard/agenda',
        active: (p: string) => p.startsWith('/dashboard/agenda'),
        permission: PERMISSIONS.VIEW_AGENDA,
        iconColor: 'text-indigo-500',
        activeBg: 'bg-indigo-50',
        activeText: 'text-indigo-700',
    },
    {
        label: 'Pacientes',
        icon: Users,
        href: '/dashboard/patients',
        active: (p: string) => p.startsWith('/dashboard/patients'),
        permission: PERMISSIONS.VIEW_PATIENTS,
        iconColor: 'text-emerald-500',
        activeBg: 'bg-emerald-50',
        activeText: 'text-emerald-700',
    },
    {
        label: 'Fisioterapeutas',
        icon: Activity,
        href: '/dashboard/physiotherapists',
        active: (p: string) => p.startsWith('/dashboard/physiotherapists'),
        permission: PERMISSIONS.VIEW_PHYSIOS,
        iconColor: 'text-cyan-500',
        activeBg: 'bg-cyan-50',
        activeText: 'text-cyan-700',
    },
    {
        label: 'Usuarios',
        icon: Shield,
        href: '/dashboard/users',
        active: (p: string) => p.startsWith('/dashboard/users'),
        permission: PERMISSIONS.VIEW_USERS,
        iconColor: 'text-violet-500',
        activeBg: 'bg-violet-50',
        activeText: 'text-violet-700',
    },
    {
        label: 'Expedientes',
        icon: FileText,
        href: '/dashboard/emr',
        active: (p: string) => p.startsWith('/dashboard/emr'),
        permission: PERMISSIONS.VIEW_EMR,
        iconColor: 'text-orange-500',
        activeBg: 'bg-orange-50',
        activeText: 'text-orange-700',
    },
    {
        label: 'Finanzas',
        icon: DollarSign,
        href: '/dashboard/finance',
        active: (p: string) => p.startsWith('/dashboard/finance'),
        permission: PERMISSIONS.VIEW_FINANCE,
        iconColor: 'text-green-500',
        activeBg: 'bg-green-50',
        activeText: 'text-green-700',
    },
    {
        label: 'Ejercicios',
        icon: Dumbbell,
        href: '/dashboard/exercises',
        active: (p: string) => p.startsWith('/dashboard/exercises'),
        permission: PERMISSIONS.VIEW_EXERCISES,
        iconColor: 'text-pink-500',
        activeBg: 'bg-pink-50',
        activeText: 'text-pink-700',
    },
    {
        label: 'Plantillas',
        icon: Copy,
        href: '/dashboard/templates',
        active: (p: string) => p.startsWith('/dashboard/templates'),
        permission: PERMISSIONS.VIEW_TEMPLATES,
        iconColor: 'text-amber-500',
        activeBg: 'bg-amber-50',
        activeText: 'text-amber-700',
    },
    {
        label: 'Configuración',
        icon: Settings,
        href: '/dashboard/settings',
        active: (p: string) => p.startsWith('/dashboard/settings'),
        permission: PERMISSIONS.VIEW_SETTINGS,
        iconColor: 'text-slate-400',
        activeBg: 'bg-slate-100',
        activeText: 'text-slate-700',
    },
]

export function DashboardSidebar({ permissions = [], userInitials = 'U', userName = '' }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const { isCollapsed, toggle } = useSidebar()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className={cn(
            "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Logo */}
            <div className={cn("py-5 flex-shrink-0 border-b border-slate-100", isCollapsed ? "px-3" : "px-5")}>
                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="h-8 w-8 min-w-[2rem] rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200 group-hover:shadow-md group-hover:shadow-blue-200 transition-all duration-200">
                        <span className="font-bold text-white text-base">C</span>
                    </div>
                    {!isCollapsed && (
                        <span className="text-lg font-bold text-slate-800 tracking-tight">
                            Clinova
                        </span>
                    )}
                </Link>
            </div>

            {/* User badge (only expanded) */}
            {!isCollapsed && userName && (
                <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {userInitials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{userName}</p>
                            <p className="text-xs text-slate-400">Personal clínico</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className={cn("flex-1 overflow-y-auto overflow-x-hidden py-3", isCollapsed ? "px-2" : "px-3")}>
                <div className="space-y-0.5">
                    {routes
                        .filter(route => hasPermission(permissions, route.permission))
                        .map((route) => {
                            const isActive = route.active(pathname)
                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    title={isCollapsed ? route.label : undefined}
                                    className={cn(
                                        "flex items-center p-2.5 w-full rounded-xl transition-all duration-150 group",
                                        isCollapsed ? "justify-center" : "gap-3",
                                        isActive
                                            ? `${route.activeBg} ${route.activeText} font-semibold`
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                    )}
                                >
                                    <route.icon className={cn(
                                        "h-5 w-5 min-w-[1.25rem] transition-colors",
                                        isActive ? route.iconColor : `${route.iconColor} opacity-60 group-hover:opacity-100`
                                    )} />
                                    {!isCollapsed && (
                                        <span className="text-sm truncate">{route.label}</span>
                                    )}
                                </Link>
                            )
                        })}

                    {hasPermission(permissions, PERMISSIONS.MANAGE_ROLES) && (
                        <Link
                            href="/dashboard/admin"
                            title={isCollapsed ? 'Super Admin' : undefined}
                            className={cn(
                                "flex items-center p-2.5 w-full rounded-xl transition-all duration-150 group",
                                isCollapsed ? "justify-center" : "gap-3",
                                pathname.startsWith('/dashboard/admin')
                                    ? "bg-red-50 text-red-700 font-semibold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            )}
                        >
                            <Shield className={cn(
                                "h-5 w-5 min-w-[1.25rem] text-red-400 transition-colors",
                                pathname.startsWith('/dashboard/admin') ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                            )} />
                            {!isCollapsed && <span className="text-sm truncate">Super Admin</span>}
                        </Link>
                    )}
                </div>
            </div>

            {/* Bottom */}
            <div className={cn("pb-4 flex-shrink-0 space-y-0.5 border-t border-slate-100 pt-3", isCollapsed ? "px-2" : "px-3")}>
                <button
                    onClick={handleSignOut}
                    title={isCollapsed ? 'Cerrar Sesión' : undefined}
                    className={cn(
                        "flex items-center p-2.5 w-full rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-150",
                        isCollapsed ? "justify-center" : "gap-3"
                    )}
                >
                    <LogOut className="h-5 w-5 min-w-[1.25rem]" />
                    {!isCollapsed && <span>Cerrar Sesión</span>}
                </button>

                <button
                    onClick={toggle}
                    title={isCollapsed ? 'Expandir' : 'Colapsar'}
                    className={cn(
                        "flex items-center p-2.5 w-full rounded-xl text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-150",
                        isCollapsed ? "justify-center" : "gap-3"
                    )}
                >
                    {isCollapsed
                        ? <PanelLeftOpen className="h-5 w-5 min-w-[1.25rem]" />
                        : <><PanelLeftClose className="h-5 w-5 min-w-[1.25rem]" /><span>Colapsar</span></>
                    }
                </button>
            </div>
        </div>
    )
}

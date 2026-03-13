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
    Sun,
    Moon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PERMISSIONS, hasPermission } from '@/lib/auth/permissions'
import { useRouter, usePathname } from 'next/navigation'
import { useSidebar } from '@/lib/contexts/sidebar-context'
import { useTheme } from 'next-themes'

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
        activeBg: 'bg-blue-50 dark:bg-blue-500/10',
        activeText: 'text-blue-700 dark:text-blue-400',
    },
    {
        label: 'Agenda',
        icon: Calendar,
        href: '/dashboard/agenda',
        active: (p: string) => p.startsWith('/dashboard/agenda'),
        permission: PERMISSIONS.VIEW_AGENDA,
        iconColor: 'text-indigo-500',
        activeBg: 'bg-indigo-50 dark:bg-indigo-500/10',
        activeText: 'text-indigo-700 dark:text-indigo-400',
    },
    {
        label: 'Pacientes',
        icon: Users,
        href: '/dashboard/patients',
        active: (p: string) => p.startsWith('/dashboard/patients'),
        permission: PERMISSIONS.VIEW_PATIENTS,
        iconColor: 'text-emerald-500',
        activeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
        activeText: 'text-emerald-700 dark:text-emerald-400',
    },
    {
        label: 'Fisioterapeutas',
        icon: Activity,
        href: '/dashboard/physiotherapists',
        active: (p: string) => p.startsWith('/dashboard/physiotherapists'),
        permission: PERMISSIONS.VIEW_PHYSIOS,
        iconColor: 'text-cyan-500',
        activeBg: 'bg-cyan-50 dark:bg-cyan-500/10',
        activeText: 'text-cyan-700 dark:text-cyan-400',
    },
    {
        label: 'Usuarios',
        icon: Shield,
        href: '/dashboard/users',
        active: (p: string) => p.startsWith('/dashboard/users'),
        permission: PERMISSIONS.VIEW_USERS,
        iconColor: 'text-violet-500',
        activeBg: 'bg-violet-50 dark:bg-violet-500/10',
        activeText: 'text-violet-700 dark:text-violet-400',
    },
    {
        label: 'Expedientes',
        icon: FileText,
        href: '/dashboard/emr',
        active: (p: string) => p.startsWith('/dashboard/emr'),
        permission: PERMISSIONS.VIEW_EMR,
        iconColor: 'text-orange-500',
        activeBg: 'bg-orange-50 dark:bg-orange-500/10',
        activeText: 'text-orange-700 dark:text-orange-400',
    },
    {
        label: 'Finanzas',
        icon: DollarSign,
        href: '/dashboard/finance',
        active: (p: string) => p.startsWith('/dashboard/finance'),
        permission: PERMISSIONS.VIEW_FINANCE,
        iconColor: 'text-green-500',
        activeBg: 'bg-green-50 dark:bg-green-500/10',
        activeText: 'text-green-700 dark:text-green-400',
    },
    {
        label: 'Ejercicios',
        icon: Dumbbell,
        href: '/dashboard/exercises',
        active: (p: string) => p.startsWith('/dashboard/exercises'),
        permission: PERMISSIONS.VIEW_EXERCISES,
        iconColor: 'text-pink-500',
        activeBg: 'bg-pink-50 dark:bg-pink-500/10',
        activeText: 'text-pink-700 dark:text-pink-400',
    },
    {
        label: 'Plantillas',
        icon: Copy,
        href: '/dashboard/templates',
        active: (p: string) => p.startsWith('/dashboard/templates'),
        permission: PERMISSIONS.VIEW_TEMPLATES,
        iconColor: 'text-amber-500',
        activeBg: 'bg-amber-50 dark:bg-amber-500/10',
        activeText: 'text-amber-700 dark:text-amber-400',
    },
    {
        label: 'Configuración',
        icon: Settings,
        href: '/dashboard/settings',
        active: (p: string) => p.startsWith('/dashboard/settings'),
        permission: PERMISSIONS.VIEW_SETTINGS,
        iconColor: 'text-slate-400',
        activeBg: 'bg-muted',
        activeText: 'text-foreground',
    },
]

export function DashboardSidebar({ permissions = [], userInitials = 'U', userName = '' }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const { isCollapsed, toggle } = useSidebar()
    const { theme, setTheme } = useTheme()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const isDark = theme === 'dark'

    return (
        <div className={cn(
            "flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Logo */}
            <div className={cn("py-5 flex-shrink-0 border-b border-border", isCollapsed ? "px-3" : "px-5")}>
                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="h-8 w-8 min-w-[2rem] rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200 group-hover:shadow-md group-hover:shadow-blue-200 transition-all duration-200">
                        <span className="font-bold text-white text-base">C</span>
                    </div>
                    {!isCollapsed && (
                        <span className="text-lg font-bold text-foreground tracking-tight">
                            Clinova
                        </span>
                    )}
                </Link>
            </div>

            {/* User badge (only expanded) */}
            {!isCollapsed && userName && (
                <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {userInitials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                            <p className="text-xs text-muted-foreground">Personal clínico</p>
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
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                                    ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-semibold"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
            <div className={cn("pb-4 flex-shrink-0 space-y-0.5 border-t border-border pt-3", isCollapsed ? "px-2" : "px-3")}>
                {/* Dark mode toggle */}
                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    title={isDark ? 'Modo claro' : 'Modo oscuro'}
                    className={cn(
                        "flex items-center p-2.5 w-full rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150",
                        isCollapsed ? "justify-center" : "gap-3"
                    )}
                >
                    {isDark
                        ? <Sun className="h-5 w-5 min-w-[1.25rem]" />
                        : <Moon className="h-5 w-5 min-w-[1.25rem]" />
                    }
                    {!isCollapsed && <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>}
                </button>

                <button
                    onClick={handleSignOut}
                    title={isCollapsed ? 'Cerrar Sesión' : undefined}
                    className={cn(
                        "flex items-center p-2.5 w-full rounded-xl text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150",
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
                        "flex items-center p-2.5 w-full rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150",
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

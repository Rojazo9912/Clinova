'use client'

import { useState } from 'react'
import { SidebarProvider, useSidebar } from '@/lib/contexts/sidebar-context'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import GlobalSearch from '@/components/search/GlobalSearch'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

interface DashboardShellProps {
    children: React.ReactNode
    permissions: string[]
    userName?: string
    userInitials?: string
}

function InnerShell({ children, permissions, userName, userInitials }: DashboardShellProps) {
    const { isCollapsed } = useSidebar()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="h-full relative bg-[#FEF9F2]">
            {/* Desktop Sidebar (fixed) */}
            <div className={cn(
                "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-[80] transition-all duration-300 ease-in-out",
                isCollapsed ? "md:w-16" : "md:w-64"
            )}>
                <DashboardSidebar
                    permissions={permissions}
                    userName={userName}
                    userInitials={userInitials}
                />
            </div>

            {/* Mobile: top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-[80] h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="font-bold text-white text-sm">C</span>
                    </div>
                    <span className="text-base font-bold text-slate-800">Clinova</span>
                </div>
            </div>

            {/* Mobile: drawer backdrop */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile: drawer */}
            <div className={cn(
                "md:hidden fixed inset-y-0 left-0 z-[100] w-64 transition-transform duration-300 ease-in-out",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="absolute top-3 right-3 z-10">
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <DashboardSidebar
                    permissions={permissions}
                    userName={userName}
                    userInitials={userInitials}
                />
            </div>

            {/* Main Content */}
            <main className={cn(
                "min-h-screen transition-all duration-300 ease-in-out pt-14 md:pt-0",
                isCollapsed ? "md:pl-16" : "md:pl-64"
            )}>
                <div className="p-6 md:p-8 max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>

            <GlobalSearch />
        </div>
    )
}

export function DashboardShell({ children, permissions, userName, userInitials }: DashboardShellProps) {
    return (
        <SidebarProvider>
            <InnerShell permissions={permissions} userName={userName} userInitials={userInitials}>
                {children}
            </InnerShell>
        </SidebarProvider>
    )
}

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import PortalHeader from './PortalHeader'
import PortalSidebar from './PortalSidebar'
import PortalBottomNav from './PortalBottomNav'

export default function PortalLayoutWrapper({ 
    children, 
    patientName 
}: { 
    children: React.ReactNode,
    patientName?: string
}) {
    const pathname = usePathname()
    
    // Pages that should NOT have the App Shell
    const isAuthPage = pathname.includes('/login') || 
                       pathname.includes('/forgot-password') || 
                       pathname.includes('/reset-password')

    if (isAuthPage) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black/95">
            <PortalHeader patientName={patientName} />
            
            <div className="flex container mx-auto">
                <PortalSidebar />
                <main className="flex-1 p-4 pb-24 sm:pb-8 sm:pl-72 min-h-[calc(100vh-64px)] overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <PortalBottomNav />
        </div>
    )
}

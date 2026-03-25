'use client'

import { Bell, LogOut, User, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

interface PortalHeaderProps {
    patientName?: string
}

export default function PortalHeader({ patientName }: PortalHeaderProps) {
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/portal/login')
    }

    return (
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl italic leading-none">C</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden sm:block">Clinova</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                    </button>

                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 p-1 pl-3 bg-muted/50 rounded-full border border-border hover:bg-muted transition"
                        >
                            <span className="text-sm font-medium hidden sm:block">{patientName || 'Paciente'}</span>
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border py-1 animate-in fade-in zoom-in duration-200">
                                <Link 
                                    href="/portal/settings" 
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User className="w-4 h-4" /> Mi Perfil
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-left"
                                >
                                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, FileText, CreditCard, Dumbbell, LogOut, User } from 'lucide-react'

interface PortalLayoutProps {
    children: React.ReactNode
}

export default function PortalDashboardLayout({ children }: PortalLayoutProps) {
    const [patientName, setPatientName] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function loadPatientData() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/portal/login')
                return
            }

            // Get patient data
            const { data: patientUser } = await supabase
                .from('patient_users')
                .select('patient_id')
                .eq('user_id', user.id)
                .single()

            if (patientUser) {
                const { data: patient } = await supabase
                    .from('patients')
                    .select('first_name, last_name')
                    .eq('id', patientUser.patient_id)
                    .single()

                if (patient) {
                    setPatientName(`${patient.first_name} ${patient.last_name}`)
                }
            }
        }

        loadPatientData()
    }, [router, supabase])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/portal/login')
    }

    const navigation = [
        { name: 'Inicio', href: '/portal/dashboard', icon: User },
        { name: 'Mis Citas', href: '/portal/appointments', icon: Calendar },
        { name: 'Expediente', href: '/portal/medical-records', icon: FileText },
        { name: 'Pagos', href: '/portal/payments', icon: CreditCard },
        { name: 'Ejercicios', href: '/portal/exercises', icon: Dumbbell },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <span className="font-semibold text-slate-900">Portal del Paciente</span>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600">{patientName}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            >
                                <LogOut className="w-4 h-4" />
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <aside className="w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-white hover:shadow-sm rounded-lg transition"
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}

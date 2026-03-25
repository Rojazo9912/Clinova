'use client'

import { useEffect, useState } from 'react'
import { getPatientProfile, updatePatientProfile } from '@/lib/actions/portal'
import { createClient } from '@/lib/supabase/client'
import { User, Phone, MapPin, Lock, Save, Loader2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    
    // Form states
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: ''
    })

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        async function loadProfile() {
            setLoading(true)
            const data = await getPatientProfile()
            if (data) {
                setProfile(data)
                setFormData({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    postal_code: data.postal_code || ''
                })
            }
            setLoading(false)
        }
        loadProfile()
    }, [])

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        const result = await updatePatientProfile(formData)
        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
        setSubmitting(false)
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setPasswordLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({
            password: passwordData.newPassword
        })

        if (error) {
            toast.error('Error al actualizar contraseña: ' + error.message)
        } else {
            toast.success('Contraseña actualizada correctamente')
            setPasswordData({ newPassword: '', confirmPassword: '' })
        }
        setPasswordLoading(false)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
                <p className="text-muted-foreground mt-2">Gestiona tu información personal y seguridad</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation Sidebar */}
                <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5" />
                            <span>Perfil</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 text-muted-foreground hover:bg-muted rounded-lg transition">
                        <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5" />
                            <span>Seguridad</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Profile Section */}
                    <div className="bg-card rounded-xl border border-border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Información Personal</h2>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-muted-foreground">Nombre(s)</label>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-muted-foreground">Apellido(s)</label>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input 
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full pl-10 p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 space-y-4 border-t border-border mt-6">
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                    <MapPin className="w-4 h-4" />
                                    Dirección
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-muted-foreground">Calle y Número</label>
                                    <input 
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
                                        <input 
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                                            className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                        <input 
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                                            className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-muted-foreground">CP</label>
                                        <input 
                                            type="text"
                                            value={formData.postal_code}
                                            onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                                            className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Password Section */}
                    <div className="bg-card rounded-xl border border-border p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Cambiar Contraseña</h2>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-muted-foreground">Nueva Contraseña</label>
                                    <input 
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-muted-foreground">Confirmar Contraseña</label>
                                    <input 
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={passwordLoading}
                                    variant="outline"
                                >
                                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                                    Actualizar Contraseña
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

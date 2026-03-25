'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClinicServices, getClinicPhysiotherapists, getAvailableSlots, bookAppointment } from '@/lib/actions/portal'
import { Calendar as CalendarIcon, Clock, User, ChevronRight, ChevronLeft, Check, AlertCircle, Loader2 } from 'lucide-react'
import { format, addDays, startOfToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'

interface Service {
    id: string
    name: string
    duration_minutes: number
    price: number
}

interface Therapist {
    id: string
    full_name: string
}

export default function NewAppointmentPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    
    // Data
    const [services, setServices] = useState<Service[]>([])
    const [therapists, setTherapists] = useState<Therapist[]>([])
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    
    // Selection
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
    const [selectedDate, setSelectedDate] = useState<string>(format(startOfToday(), 'yyyy-MM-dd'))
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [notes, setNotes] = useState('')
    
    // Loading states
    const [loading, setLoading] = useState(true)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        async function loadInitialData() {
            setLoading(true)
            try {
                const [servicesData, therapistsData] = await Promise.all([
                    getClinicServices(),
                    getClinicPhysiotherapists()
                ])
                setServices(servicesData as Service[])
                setTherapists(therapistsData as Therapist[])
            } finally {
                setLoading(false)
            }
        }
        loadInitialData()
    }, [])

    useEffect(() => {
        if (selectedService && selectedDate && step === 3) {
            loadSlots()
        }
    }, [selectedService, selectedDate, selectedTherapist, step])

    async function loadSlots() {
        if (!selectedService) return
        setLoadingSlots(true)
        setSelectedSlot(null)
        try {
            const slots = await getAvailableSlots(
                selectedDate, 
                selectedService.id, 
                selectedTherapist?.id
            )
            setAvailableSlots(slots)
        } finally {
            setLoadingSlots(false)
        }
    }

    async function handleBooking() {
        if (!selectedService || !selectedSlot) return
        
        setSubmitting(true)
        try {
            const result = await bookAppointment({
                serviceId: selectedService.id,
                therapistId: selectedTherapist?.id || null,
                date: selectedDate,
                time: selectedSlot,
                notes
            })

            if (result.success) {
                toast.success(result.message)
                router.push('/portal/appointments')
            } else {
                toast.error(result.message)
                setSubmitting(false)
            }
        } catch (error) {
            toast.error('Error al agendar la cita')
            setSubmitting(false)
        }
    }

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-muted-foreground animate-pulse text-sm font-medium">Cargando opciones...</p>
            </div>
        )
    }

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
            {/* Header with Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Agendar Cita</h1>
                        <p className="text-sm text-muted-foreground">Paso {step} de 4</p>
                    </div>
                    {step > 1 && (
                        <button 
                            onClick={prevStep}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" /> Regresar
                        </button>
                    )}
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-blue-600"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1: Services */}
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            ¿Qué servicio necesitas?
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {services.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => { setSelectedService(service); nextStep(); }}
                                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition text-left group ${
                                        selectedService?.id === service.id 
                                            ? 'border-blue-600 bg-blue-50/50' 
                                            : 'border-border hover:border-blue-200 hover:bg-muted/30'
                                    }`}
                                >
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground group-hover:text-blue-700 transition-colors">
                                            {service.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-blue-500" /> {service.duration_minutes} minutos
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-blue-600 font-black text-xl">${service.price}</p>
                                        {selectedService?.id === service.id && (
                                            <div className="mt-2 flex justify-end">
                                               <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                               </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Therapist & Date */}
                {step === 2 && (
                    <motion.div 
                        key="step2"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                <User className="w-5 h-5 text-blue-600" /> ¿Con quién te gustaría agendar?
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => setSelectedTherapist(null)}
                                    className={`p-4 rounded-xl border-2 transition text-center ${
                                        !selectedTherapist ? 'border-blue-600 bg-blue-50/50' : 'border-border hover:bg-muted/50'
                                    }`}
                                >
                                    <span className="font-bold block">Cualquier profesional</span>
                                    {!selectedTherapist && <span className="text-xs text-blue-600 mt-1 block">Seleccionado</span>}
                                </button>
                                {therapists.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTherapist(t)}
                                        className={`p-4 rounded-xl border-2 transition text-center ${
                                            selectedTherapist?.id === t.id ? 'border-blue-600 bg-blue-50/50' : 'border-border hover:bg-muted/50'
                                        }`}
                                    >
                                        <span className="font-bold block">{t.full_name}</span>
                                        {selectedTherapist?.id === t.id && <span className="text-xs text-blue-600 mt-1 block">Seleccionado</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                <CalendarIcon className="w-5 h-5 text-blue-600" /> ¿Qué día prefieres?
                            </h2>
                            <div className="bg-card border-2 rounded-2xl p-6">
                                <input 
                                    type="date" 
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full p-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-lg font-medium"
                                />
                                <p className="text-sm text-muted-foreground mt-4 text-center">
                                    {format(parseISO(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}
                                </p>
                            </div>
                        </div>

                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-blue-500/20"
                            onClick={nextStep}
                        >
                            Ver horarios disponibles <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                )}

                {/* Step 3: Slots */}
                {step === 3 && (
                    <motion.div 
                        key="step3"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2">
                             Horarios disponibles para el {format(parseISO(selectedDate), "d 'de' MMMM", { locale: es })}
                        </h2>
                        
                        {loadingSlots ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <p className="text-muted-foreground text-sm font-medium">Buscando espacios...</p>
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => { setSelectedSlot(slot); nextStep(); }}
                                        className={`p-4 text-center rounded-2xl border-2 transition font-bold text-lg ${
                                            selectedSlot === slot 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30' 
                                                : 'border-border hover:border-blue-300 hover:bg-blue-50/50'
                                        }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/30 rounded-3xl p-10 text-center">
                                <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                                <p className="text-amber-800 dark:text-amber-400 font-black text-xl">¡Oops! Sin disponibilidad</p>
                                <p className="text-amber-700 dark:text-amber-500 text-sm mt-2 max-w-[200px] mx-auto">
                                    No hay horarios para este día o profesional. Prueba con una fecha distinta.
                                </p>
                                <Button 
                                    variant="outline" 
                                    className="mt-6 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                                    onClick={prevStep}
                                >
                                    Elegir otra fecha
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Step 4: Confirm */}
                {step === 4 && (
                    <motion.div 
                        key="step4"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                    >
                        <Card className="p-8 border-2 border-blue-100 dark:border-blue-900/30 rounded-3xl bg-card">
                            <h2 className="text-2xl font-black mb-8 text-center text-foreground">Detalles de tu cita</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Servicio</p>
                                        <p className="font-bold text-xl">{selectedService?.name}</p>
                                        <p className="text-sm text-blue-600 font-bold">{selectedService?.duration_minutes} min • ${selectedService?.price}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Profesional</p>
                                        <p className="font-bold text-xl">{selectedTherapist?.full_name || 'Cualquier profesional'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <CalendarIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Fecha y Hora</p>
                                        <p className="font-bold text-xl capitalize">
                                            {format(parseISO(selectedDate), "EEEE, d 'de' MMMM", { locale: es })}
                                        </p>
                                        <p className="font-black text-2xl text-blue-600 mt-1">{selectedSlot} hrs</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border">
                                <label className="block text-sm font-bold text-muted-foreground uppercase mb-3">Notas adicionales</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="¿Algún detalle para el fisioterapeuta?"
                                    className="w-full p-4 bg-muted/30 border-2 border-border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none h-32 transition-all"
                                />
                            </div>
                        </Card>

                        <Button 
                            disabled={submitting}
                            onClick={handleBooking}
                            className="w-full bg-green-600 hover:bg-green-700 h-16 rounded-2xl text-xl font-black text-white shadow-xl shadow-green-500/20"
                        >
                            {submitting ? (
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            ) : (
                                "Confirmar y agendar cita"
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

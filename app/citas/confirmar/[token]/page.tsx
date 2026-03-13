
import { confirmAppointment } from '@/lib/actions/appointments'
import { CheckCircle, XCircle, Calendar, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

export default async function ConfirmAppointmentPage({ params }: { params: { token: string } }) {
    const { token } = await params
    const result = await confirmAppointment(token)

    if (!result.success || !result.data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="bg-card p-8 rounded-2xl shadow-sm border border-border max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">Enlace inválido o expirado</h1>
                    <p className="text-muted-foreground">
                        {result.message || 'No pudimos encontrar la cita. Por favor contacta a la clínica.'}
                    </p>
                    <Link
                        href="/"
                        className="inline-block mt-4 text-blue-600 font-medium hover:underline"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        )
    }

    const { data } = result
    const date = new Date(data.start_time)

    // Handle potential array response from Supabase joins
    const patient = Array.isArray(data.patients) ? data.patients[0] : data.patients
    const clinic = Array.isArray(data.clinics) ? data.clinics[0] : data.clinics

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {result.alreadyConfirmed ? 'Cita ya confirmada' : '¡Cita Confirmada!'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Gracias <strong>{patient?.first_name}</strong>, te esperamos.
                    </p>
                </div>

                <div className="bg-muted rounded-xl p-4 text-left space-y-3">
                    <div className="flex items-center text-foreground">
                        <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="font-medium">
                            {format(date, "EEEE d 'de' MMMM", { locale: es })}
                        </span>
                    </div>
                    <div className="flex items-center text-foreground">
                        <Clock className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="font-medium">
                            {format(date, "h:mm a", { locale: es })}
                        </span>
                    </div>
                    <div className="flex items-center text-foreground">
                        <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="font-medium">
                            {clinic?.name || 'Clínica'}
                        </span>
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        Si necesitas reagendar, por favor contáctanos por WhatsApp.
                    </p>
                </div>
            </div>
        </div>
    )
}

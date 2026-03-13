import { getDashboardMetrics, getRevenueChartData, getTodayAppointments, getCurrentUserProfile, getBusinessAlerts } from '@/lib/actions/dashboard'
import MetricCard from '@/components/dashboard/MetricCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import AppointmentTimeline from '@/components/dashboard/AppointmentTimeline'
import BusinessAlertsPanel from '@/components/dashboard/BusinessAlertsPanel'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
}

function getGreetingEmoji() {
    const hour = new Date().getHours()
    if (hour < 12) return '☀️'
    if (hour < 19) return '👋'
    return '🌙'
}

export default async function DashboardPage() {
    const [metrics, revenueData, appointments, userName, alerts] = await Promise.all([
        getDashboardMetrics(),
        getRevenueChartData(),
        getTodayAppointments(),
        getCurrentUserProfile(),
        getBusinessAlerts(),
    ])

    if (!metrics) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                    No se pudo cargar la información del dashboard
                </div>
            </div>
        )
    }

    const firstName = userName?.split(' ')[0] ?? 'Doctor'
    const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

    return (
        <div className="space-y-6">
            {/* Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground capitalize">{today}</p>
                    <h1 className="text-3xl font-extrabold text-foreground mt-0.5">
                        {getGreeting()}, {firstName}! {getGreetingEmoji()}
                    </h1>
                </div>
                <Link
                    href="/dashboard/agenda"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-200 hover:shadow-md hover:shadow-emerald-200 transition-all duration-200 w-fit"
                >
                    <Plus className="h-4 w-4" />
                    + Añadir cita
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Pacientes Totales"
                    value={metrics.totalPatients}
                    change={metrics.patientChange}
                    trend={metrics.patientChange >= 0 ? 'up' : 'down'}
                    subtitle="vs mes anterior"
                    emoji="🧑‍⚕️"
                    friendlyText="¡Nuevas sonrisas!"
                    bgFrom="from-orange-50"
                    bgTo="to-amber-50"
                />
                <MetricCard
                    title="Ingresos del Mes"
                    value={`$${metrics.revenue.toLocaleString()}`}
                    change={metrics.revenueChange}
                    trend={metrics.revenueChange >= 0 ? 'up' : 'down'}
                    subtitle="vs mes anterior"
                    emoji="💰"
                    friendlyText="¡Gran mes!"
                    bgFrom="from-emerald-50"
                    bgTo="to-teal-50"
                />
                <MetricCard
                    title="Citas de Hoy"
                    value={metrics.appointmentsToday}
                    subtitle={`${metrics.appointmentsThisMonth} este mes`}
                    emoji="📅"
                    friendlyText="Acumulado"
                    bgFrom="from-blue-50"
                    bgTo="to-indigo-50"
                />
                <MetricCard
                    title="Citas del Mes"
                    value={metrics.appointmentsThisMonth}
                    change={metrics.appointmentChange}
                    trend={metrics.appointmentChange >= 0 ? 'up' : 'down'}
                    subtitle="vs mes anterior"
                    emoji="📈"
                    friendlyText="Acumulado"
                    bgFrom="from-violet-50"
                    bgTo="to-purple-50"
                />
            </div>

            {/* Business Health */}
            {alerts && (
                <BusinessAlertsPanel
                    pendingAmount={alerts.pendingAmount}
                    pendingPlansCount={alerts.pendingPlansCount}
                    inactivePatients={alerts.inactivePatients}
                    completionRate={alerts.completionRate}
                    scheduledThisMonth={alerts.scheduledThisMonth}
                />
            )}

            {/* Today's Patients */}
            <AppointmentTimeline appointments={appointments} />

            {/* Revenue Chart */}
            <RevenueChart data={revenueData} />
        </div>
    )
}

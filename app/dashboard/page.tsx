import { getDashboardMetrics, getRevenueChartData, getTodayAppointments, getCurrentUserProfile, getBusinessAlerts } from '@/lib/actions/dashboard'
import MetricCard from '@/components/dashboard/MetricCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import AppointmentTimeline from '@/components/dashboard/AppointmentTimeline'
import BusinessAlertsPanel from '@/components/dashboard/BusinessAlertsPanel'
import { Users, Calendar, DollarSign, Activity } from '@/components/ui/icons'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
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
                <div className="bg-destructive/15 text-destructive p-4 rounded-md">
                    No se pudo cargar la información del dashboard
                </div>
            </div>
        )
    }

    const firstName = userName?.split(' ')[0] ?? 'Doctor'
    const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

    return (
        <div className="space-y-8">
            {/* Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                    <p className="text-sm font-medium text-slate-500 capitalize">{today}</p>
                    <h1 className="text-3xl font-bold text-slate-900 mt-1">
                        {getGreeting()}, {firstName} 👋
                    </h1>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm text-slate-600 w-fit">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>
                        {appointments.length === 0
                            ? 'Sin citas hoy'
                            : appointments.length === 1
                            ? '1 cita hoy'
                            : `${appointments.length} citas hoy`}
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Pacientes Totales"
                    value={metrics.totalPatients}
                    change={metrics.patientChange}
                    icon={Users}
                    trend={metrics.patientChange >= 0 ? 'up' : 'down'}
                    subtitle="vs mes anterior"
                />
                <MetricCard
                    title="Ingresos del Mes"
                    value={`$${metrics.revenue.toLocaleString()}`}
                    change={metrics.revenueChange}
                    icon={DollarSign}
                    trend={metrics.revenueChange >= 0 ? 'up' : 'down'}
                    subtitle="vs mes anterior"
                />
                <MetricCard
                    title="Citas de Hoy"
                    value={metrics.appointmentsToday}
                    icon={Calendar}
                    subtitle={`${metrics.appointmentsThisMonth} este mes`}
                />
                <MetricCard
                    title="Citas del Mes"
                    value={metrics.appointmentsThisMonth}
                    change={metrics.appointmentChange}
                    icon={Activity}
                    trend={metrics.appointmentChange >= 0 ? 'up' : 'down'}
                    subtitle="vs mes anterior"
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

            {/* Today's Patients — full width, the star of the page */}
            <AppointmentTimeline appointments={appointments} />

            {/* Revenue Chart */}
            <RevenueChart data={revenueData} />
        </div>
    )
}

import { getDashboardMetrics, getRevenueChartData, getTodayAppointments } from '@/lib/actions/dashboard'
import MetricCard from '@/components/dashboard/MetricCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import AppointmentTimeline from '@/components/dashboard/AppointmentTimeline'
import { Users, Calendar, DollarSign, Activity } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    // Fetch all dashboard data in parallel
    const [metrics, revenueData, appointments] = await Promise.all([
        getDashboardMetrics(),
        getRevenueChartData(),
        getTodayAppointments()
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

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Resumen de tu clínica en tiempo real
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

            {/* Charts and Timeline */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RevenueChart data={revenueData} />
                <AppointmentTimeline appointments={appointments} />
            </div>
        </div>
    )
}

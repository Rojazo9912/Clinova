'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getServices, getPayments, getFinancialReport, getPendingCollections } from '@/lib/actions/finance'
import ServiceModal from '@/components/finance/ServiceModal'
import PaymentModal from '@/components/finance/PaymentModal'
import PageHeader from '@/components/ui/PageHeader'
import { generateFinancialReport } from '@/lib/pdf/reports'
import { DollarSign, FileDown, AlertCircle, Plus, CreditCard, Clock } from 'lucide-react'
import Link from 'next/link'

export default function FinancePage() {
    const searchParams = useSearchParams()
    const initialTab = searchParams.get('tab') === 'pending' ? 'pending' : 'services'

    const [activeTab, setActiveTab] = useState<'services' | 'payments' | 'reports' | 'pending'>(initialTab as any)
    const [services, setServices] = useState<any[]>([])
    const [payments, setPayments] = useState<any[]>([])
    const [report, setReport] = useState<any>({ total: 0, byMethod: {}, byService: {} })
    const [pendingCollections, setPendingCollections] = useState<any[]>([])
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            const [servicesData, paymentsData, pendingData] = await Promise.all([
                getServices(),
                getPayments(),
                getPendingCollections(),
            ])
            setServices(servicesData)
            setPayments(paymentsData)
            setPendingCollections(pendingData)

            const endDate = new Date().toISOString()
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            const reportData = await getFinancialReport(startDate, endDate)
            setReport(reportData)
        }
        fetchData()
    }, [refreshKey])

    const tabs: { key: 'services' | 'payments' | 'reports' | 'pending'; label: string; badge?: number | null }[] = [
        { key: 'services', label: 'Servicios' },
        { key: 'payments', label: 'Pagos' },
        { key: 'reports', label: 'Reportes' },
        { key: 'pending', label: 'Cobros Pendientes', badge: pendingCollections.length > 0 ? pendingCollections.length : null },
    ]

    return (
        <div className="space-y-6">
            <PageHeader title="Finanzas" description="Gestiona servicios, pagos y reportes financieros.">
                {activeTab === 'services' && (
                    <button
                        onClick={() => setIsServiceModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Servicio
                    </button>
                )}
                {(activeTab === 'payments' || activeTab === 'pending') && (
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Registrar Pago
                    </button>
                )}
            </PageHeader>

            {/* Summary metric cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Ingresos (30 días)</p>
                        <p className="text-2xl font-bold text-foreground">${report.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Pagos registrados</p>
                        <p className="text-2xl font-bold text-foreground">{payments.length}</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Cobros pendientes</p>
                        <p className="text-2xl font-bold text-foreground">
                            {pendingCollections.reduce((s, p) => s + p.pending, 0) > 0
                                ? `$${pendingCollections.reduce((s, p) => s + p.pending, 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}`
                                : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Pill Tabs */}
            <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                            activeTab === tab.key
                                ? 'bg-card shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tab.label}
                        {tab.badge != null && (
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-none ${
                                activeTab === tab.key
                                    ? 'bg-red-500 text-white'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            }`}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Services Tab */}
            {activeTab === 'services' && (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Servicio</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descripción</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Precio</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Duración</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground text-sm">No hay servicios registrados.</td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{service.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-sm">{service.description || '—'}</td>
                                        <td className="px-6 py-4 text-emerald-700 dark:text-emerald-400 font-semibold">${service.price}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-sm">{service.duration_minutes} min</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paciente</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Servicio</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monto</th>
                                <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Método</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">No hay pagos registrados.</td>
                                </tr>
                            ) : (
                                payments.map((payment: any) => (
                                    <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground text-sm">
                                            {new Date(payment.created_at).toLocaleDateString('es-MX')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {payment.patients?.first_name} {payment.patients?.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-sm">{payment.services?.name || '—'}</td>
                                        <td className="px-6 py-4 text-emerald-700 dark:text-emerald-400 font-semibold">${payment.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                                                {payment.payment_method}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={async () => {
                                const endDate = new Date()
                                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

                                const detailedPayments = payments.map((p: any) => ({
                                    date: new Date(p.created_at).toLocaleDateString('es-MX'),
                                    patient: `${p.patients?.first_name || ''} ${p.patients?.last_name || ''}`,
                                    service: p.services?.name || 'Sin servicio',
                                    amount: Number(p.amount),
                                    method: p.payment_method
                                }))

                                generateFinancialReport({
                                    clinicName: 'AxoMed',
                                    startDate: startDate.toLocaleDateString('es-MX'),
                                    endDate: endDate.toLocaleDateString('es-MX'),
                                    totalRevenue: report.total,
                                    paymentsByMethod: report.byMethod,
                                    paymentsByService: report.byService,
                                    payments: detailedPayments
                                })
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition text-sm font-medium"
                        >
                            <FileDown className="h-4 w-4" />
                            Exportar PDF
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Total (30 días)</p>
                                    <h3 className="text-2xl font-bold text-foreground">${report.total.toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Por Método de Pago</h4>
                            <div className="space-y-2">
                                {Object.entries(report.byMethod).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Sin datos</p>
                                ) : Object.entries(report.byMethod).map(([method, amount]: [string, any]) => (
                                    <div key={method} className="flex justify-between text-sm">
                                        <span className="capitalize text-muted-foreground">{method}</span>
                                        <span className="font-semibold text-foreground">${amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                            <h4 className="text-sm font-semibold text-foreground mb-3">Por Servicio</h4>
                            <div className="space-y-2">
                                {Object.entries(report.byService).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Sin datos</p>
                                ) : Object.entries(report.byService).slice(0, 5).map(([service, amount]: [string, any]) => (
                                    <div key={service} className="flex justify-between text-sm">
                                        <span className="truncate text-muted-foreground">{service}</span>
                                        <span className="font-semibold text-foreground">${amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Collections Tab */}
            {activeTab === 'pending' && (
                <div className="space-y-4">
                    {pendingCollections.length === 0 ? (
                        <div className="bg-card rounded-2xl border border-border shadow-sm p-10 text-center">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="font-semibold text-foreground">Todo al corriente</p>
                            <p className="text-sm text-muted-foreground mt-1">No hay planes de tratamiento con saldo pendiente.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 px-1">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-red-600 dark:text-red-400">
                                        ${pendingCollections.reduce((s, p) => s + p.pending, 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                    </span>
                                    {' '}pendientes en {pendingCollections.length} plan{pendingCollections.length !== 1 ? 'es' : ''} activo{pendingCollections.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-muted border-b border-border">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paciente</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plan</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sesiones</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pagado</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pendiente</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {pendingCollections.map((plan) => (
                                            <tr key={plan.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-foreground">
                                                    <Link href={`/dashboard/patients/${plan.patient_id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                        {plan.patient_name}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground text-sm">{plan.title}</td>
                                                <td className="px-6 py-4 text-muted-foreground text-sm">
                                                    {plan.completed_sessions}/{plan.total_sessions}
                                                </td>
                                                <td className="px-6 py-4 text-foreground font-medium text-sm">
                                                    ${plan.package_price.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                                                    ${plan.paid_amount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                                                        ${plan.pending.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setIsPaymentModalOpen(true)}
                                                        className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                                                    >
                                                        Cobrar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}

            <ServiceModal
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                onSuccess={() => {
                    setRefreshKey(k => k + 1)
                    setIsServiceModalOpen(false)
                }}
            />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                    setRefreshKey(k => k + 1)
                    setIsPaymentModalOpen(false)
                }}
            />
        </div>
    )
}

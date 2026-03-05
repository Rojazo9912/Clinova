'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getServices, getPayments, getFinancialReport, getPendingCollections } from '@/lib/actions/finance'
import ServiceModal from '@/components/finance/ServiceModal'
import PaymentModal from '@/components/finance/PaymentModal'
import PageHeader from '@/components/ui/PageHeader'
import { generateFinancialReport } from '@/lib/pdf/reports'
import { DollarSign, CreditCard, TrendingUp, FileDown, AlertCircle } from 'lucide-react'
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

    return (
        <div className="space-y-6">
            <PageHeader title="Finanzas" description="Gestiona servicios, pagos y reportes financieros.">
                {activeTab === 'services' && (
                    <button
                        onClick={() => setIsServiceModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        Nuevo Servicio
                    </button>
                )}
                {(activeTab === 'payments' || activeTab === 'pending') && (
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                    >
                        Registrar Pago
                    </button>
                )}
            </PageHeader>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 font-medium transition ${activeTab === 'services'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Servicios
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-4 py-2 font-medium transition ${activeTab === 'payments'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Pagos
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-2 font-medium transition ${activeTab === 'reports'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Reportes
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 font-medium transition flex items-center gap-1.5 ${activeTab === 'pending'
                        ? 'border-b-2 border-red-500 text-red-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Cobros Pendientes
                    {pendingCollections.length > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                            {pendingCollections.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Services Tab */}
            {activeTab === 'services' && (
                <div className="bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Servicio</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Descripción</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Precio</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Duración</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No hay servicios registrados.</td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{service.description || '-'}</td>
                                        <td className="px-6 py-4 text-slate-900 font-semibold">${service.price}</td>
                                        <td className="px-6 py-4 text-slate-600">{service.duration_minutes} min</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
                <div className="bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Paciente</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Servicio</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Monto</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Método</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No hay pagos registrados.</td>
                                </tr>
                            ) : (
                                payments.map((payment: any) => (
                                    <tr key={payment.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-900">
                                            {payment.patients?.first_name} {payment.patients?.last_name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{payment.services?.name || '-'}</td>
                                        <td className="px-6 py-4 text-green-600 font-semibold">${payment.amount}</td>
                                        <td className="px-6 py-4 text-slate-600 capitalize">{payment.payment_method}</td>
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
                    {/* Export Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={async () => {
                                const endDate = new Date()
                                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

                                // Get detailed payments for PDF
                                const detailedPayments = payments.map((p: any) => ({
                                    date: new Date(p.created_at).toLocaleDateString('es-MX'),
                                    patient: `${p.patients?.first_name || ''} ${p.patients?.last_name || ''}`,
                                    service: p.services?.name || 'Sin servicio',
                                    amount: Number(p.amount),
                                    method: p.payment_method
                                }))

                                generateFinancialReport({
                                    clinicName: 'Clinova',
                                    startDate: startDate.toLocaleDateString('es-MX'),
                                    endDate: endDate.toLocaleDateString('es-MX'),
                                    totalRevenue: report.total,
                                    paymentsByMethod: report.byMethod,
                                    paymentsByService: report.byService,
                                    payments: detailedPayments
                                })
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            <FileDown className="h-4 w-4" />
                            Exportar PDF
                        </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="glass-card rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100/50 rounded-xl">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total (30 días)</p>
                                    <h3 className="text-2xl font-bold text-slate-900">${report.total.toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-xl p-6">
                            <h4 className="font-semibold mb-3">Por Método de Pago</h4>
                            <div className="space-y-2">
                                {Object.entries(report.byMethod).map(([method, amount]: [string, any]) => (
                                    <div key={method} className="flex justify-between text-sm">
                                        <span className="capitalize">{method}</span>
                                        <span className="font-semibold">${amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card rounded-xl p-6">
                            <h4 className="font-semibold mb-3">Por Servicio</h4>
                            <div className="space-y-2">
                                {Object.entries(report.byService).slice(0, 5).map(([service, amount]: [string, any]) => (
                                    <div key={service} className="flex justify-between text-sm">
                                        <span className="truncate">{service}</span>
                                        <span className="font-semibold">${amount.toFixed(2)}</span>
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
                        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="font-semibold text-green-800">Todo al corriente</p>
                            <p className="text-sm text-green-600 mt-1">No hay planes de tratamiento con saldo pendiente.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 px-1">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold text-red-600">
                                        ${pendingCollections.reduce((s, p) => s + p.pending, 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                    </span>
                                    {' '}pendientes en {pendingCollections.length} plan{pendingCollections.length !== 1 ? 'es' : ''} activo{pendingCollections.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Paciente</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Sesiones</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Pagado</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Pendiente</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingCollections.map((plan) => (
                                            <tr key={plan.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    <Link href={`/dashboard/patients/${plan.patient_id}`} className="hover:text-blue-600 transition-colors">
                                                        {plan.patient_name}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{plan.title}</td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">
                                                    {plan.completed_sessions}/{plan.total_sessions}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 font-medium">
                                                    ${plan.package_price.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-6 py-4 text-green-600 font-medium">
                                                    ${plan.paid_amount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-red-600">
                                                        ${plan.pending.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setIsPaymentModalOpen(true)}
                                                        className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
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

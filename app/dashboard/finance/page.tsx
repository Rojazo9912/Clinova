'use client'

import { useEffect, useState } from 'react'
import { getServices, getPayments, getFinancialReport } from '@/lib/actions/finance'
import { searchPatients } from '@/lib/actions/patients'
import ServiceModal from '@/components/finance/ServiceModal'
import PaymentModal from '@/components/finance/PaymentModal'
import PageHeader from '@/components/ui/PageHeader'
import { generateFinancialReport } from '@/lib/pdf/reports'
import { DollarSign, CreditCard, TrendingUp, FileDown } from 'lucide-react'

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<'services' | 'payments' | 'reports'>('services')
    const [services, setServices] = useState<any[]>([])
    const [payments, setPayments] = useState<any[]>([])
    const [report, setReport] = useState<any>({ total: 0, byMethod: {}, byService: {} })
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            const servicesData = await getServices()
            setServices(servicesData)

            const paymentsData = await getPayments()
            setPayments(paymentsData)

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
                {activeTab === 'payments' && (
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

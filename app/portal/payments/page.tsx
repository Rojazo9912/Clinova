'use client'

import { useEffect, useState } from 'react'
import { getPatientPayments } from '@/lib/actions/portal'
import { generatePaymentReceipt } from '@/lib/pdf/reports'
import { CreditCard, Calendar, Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Payment {
    id: string
    amount: number
    payment_date: string
    payment_method: string
    status: string
    service: { name: string }
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadPayments() {
            const data = await getPatientPayments()
            setPayments(data as Payment[])
            setLoading(false)
        }
        loadPayments()
    }, [])

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

    const getMethodText = (method: string) => {
        const map: any = {
            cash: 'Efectivo',
            card: 'Tarjeta',
            transfer: 'Transferencia'
        }
        return map[method] || method
    }

    const getStatusColor = (status: string) => {
        return status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Historial de Pagos</h1>
                <p className="text-slate-600 mt-2">Revisa tus pagos y descarga recibos</p>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <h3 className="text-sm font-medium opacity-90">Total Pagado</h3>
                <p className="text-3xl font-bold mt-2">${totalPaid.toFixed(2)}</p>
                <p className="text-sm opacity-75 mt-1">{payments.length} pagos registrados</p>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-slate-500">Cargando...</p>
                </div>
            ) : payments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border">
                    <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No hay pagos registrados</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Servicio</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Método</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-900">
                                        {format(new Date(payment.payment_date), "d 'de' MMM, yyyy", { locale: es })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-900">{payment.service.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{getMethodText(payment.payment_method)}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">${payment.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                            {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => {
                                                // TODO: Implement PDF download
                                                alert('Función de descarga de recibo próximamente')
                                            }}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            <Download className="w-4 h-4" />
                                            Recibo
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

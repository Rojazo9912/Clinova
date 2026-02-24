'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface FinancialReportData {
    clinicName: string
    startDate: string
    endDate: string
    totalRevenue: number
    paymentsByMethod: { [key: string]: number }
    paymentsByService: { [key: string]: number }
    payments: Array<{
        date: string
        patient: string
        service: string
        amount: number
        method: string
    }>
}

export function generateFinancialReport(data: FinancialReportData) {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(37, 99, 235) // Blue
    doc.text(data.clinicName, 20, 20)

    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Reporte Financiero', 20, 30)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Período: ${data.startDate} - ${data.endDate}`, 20, 38)
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 20, 44)

    // Summary Box
    doc.setFillColor(239, 246, 255) // Light blue
    doc.rect(20, 50, 170, 30, 'F')

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Resumen Ejecutivo', 25, 58)

    doc.setFontSize(20)
    doc.setTextColor(37, 99, 235)
    doc.text(`$${data.totalRevenue.toLocaleString()}`, 25, 70)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Ingresos Totales', 25, 76)

    // Revenue by Payment Method
    let yPos = 90
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Ingresos por Método de Pago', 20, yPos)

    yPos += 10
    autoTable(doc, {
        startY: yPos,
        head: [['Método de Pago', 'Monto']],
        body: Object.entries(data.paymentsByMethod).map(([method, amount]) => [
            method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Transferencia',
            `$${amount.toLocaleString()}`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 20, right: 20 }
    })

    // Revenue by Service
    yPos = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(14)
    doc.text('Ingresos por Servicio', 20, yPos)

    yPos += 10
    autoTable(doc, {
        startY: yPos,
        head: [['Servicio', 'Monto']],
        body: Object.entries(data.paymentsByService).map(([service, amount]) => [
            service,
            `$${amount.toLocaleString()}`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 20, right: 20 }
    })

    // Detailed Payments
    if (data.payments.length > 0) {
        yPos = (doc as any).lastAutoTable.finalY + 15

        // Check if we need a new page
        if (yPos > 250) {
            doc.addPage()
            yPos = 20
        }

        doc.setFontSize(14)
        doc.text('Detalle de Pagos', 20, yPos)

        yPos += 10
        autoTable(doc, {
            startY: yPos,
            head: [['Fecha', 'Paciente', 'Servicio', 'Método', 'Monto']],
            body: data.payments.map(p => [
                p.date,
                p.patient,
                p.service,
                p.method === 'cash' ? 'Efectivo' : p.method === 'card' ? 'Tarjeta' : 'Transferencia',
                `$${p.amount.toLocaleString()}`
            ]),
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] },
            margin: { left: 20, right: 20 },
            styles: { fontSize: 8 }
        })
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        )
    }

    // Save
    const fileName = `reporte-financiero-${data.startDate}-${data.endDate}.pdf`
    doc.save(fileName)
}

export function generatePaymentReceipt(data: {
    clinicName: string
    patientName: string
    amount: number
    paymentMethod: string
    paymentDate: string
    serviceName: string
    receiptNumber: string
}) {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(37, 99, 235)
    doc.text(data.clinicName, 105, 20, { align: 'center' })

    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Recibo de Pago', 105, 30, { align: 'center' })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`No. ${data.receiptNumber}`, 105, 38, { align: 'center' })

    // Receipt Box
    doc.setFillColor(239, 246, 255)
    doc.rect(30, 50, 150, 80, 'F')

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)

    let yPos = 60
    doc.text('Paciente:', 40, yPos)
    doc.text(data.patientName, 120, yPos, { align: 'right' })

    yPos += 10
    doc.text('Servicio:', 40, yPos)
    doc.text(data.serviceName, 120, yPos, { align: 'right' })

    yPos += 10
    doc.text('Fecha:', 40, yPos)
    doc.text(data.paymentDate, 120, yPos, { align: 'right' })

    yPos += 10
    doc.text('Método de Pago:', 40, yPos)
    const methodText = data.paymentMethod === 'cash' ? 'Efectivo' :
        data.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'
    doc.text(methodText, 120, yPos, { align: 'right' })

    yPos += 15
    doc.setFontSize(16)
    doc.setTextColor(37, 99, 235)
    doc.text('Total:', 40, yPos)
    doc.text(`$${data.amount.toLocaleString()}`, 120, yPos, { align: 'right' })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
        `Generado el ${new Date().toLocaleDateString('es-MX')}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
    )

    // Save
    doc.save(`recibo-${data.receiptNumber}.pdf`)
}

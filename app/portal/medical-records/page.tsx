'use client'

import { useEffect, useState } from 'react'
import { getPatientMedicalRecords, getPatientClinicalEvolution } from '@/lib/actions/portal'
import { FileText, Calendar, User, Download, History, TrendingUp, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getPatientProfile } from '@/lib/actions/portal'

interface MedicalRecord {
    id: string
    session_date: string
    diagnosis: string | null
    treatment: string | null
    notes: string | null
    service: { name: string }
    physiotherapist: { full_name: string }
}

export default function MedicalRecordsPage() {
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [measurements, setMeasurements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const METRICS_LABELS: any = {
        dolor: 'Nivel de Dolor (EVA)',
        movilidad: 'Movilidad',
        fuerza: 'Fuerza',
        rom: 'Rango de Movimiento (ROM)',
        flexibilidad: 'Flexibilidad'
    }

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            try {
                const [recordsData, measurementsData] = await Promise.all([
                    getPatientMedicalRecords(),
                    getPatientClinicalEvolution()
                ])
                setRecords(recordsData as MedicalRecord[])
                setMeasurements(measurementsData)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const getChartData = (metric: string) => {
        return measurements
            .filter(m => m.metric === metric)
            .map(m => ({
                date: format(parseISO(m.measured_at), "d MMM", { locale: es }),
                valor: m.value,
                originalDate: m.measured_at
            }))
            .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime())
    }

    const metricsToShow = ['dolor', 'movilidad', 'fuerza']
        .filter(m => measurements.some(ms => ms.metric === m))

    const handleExportPDF = async () => {
        const doc = new jsPDF()
        const patientInfo = await getPatientProfile()
        
        // Header
        doc.setFontSize(22)
        doc.setTextColor(37, 99, 235) // blue-600
        doc.text('Clinova', 14, 20)
        
        doc.setFontSize(16)
        doc.setTextColor(31, 41, 55) // gray-800
        doc.text('Expediente Médico de Fisioterapia', 14, 30)
        
        doc.setFontSize(10)
        doc.setTextColor(107, 114, 128) // gray-500
        doc.text(`Paciente: ${patientInfo?.first_name} ${patientInfo?.last_name}`, 14, 40)
        doc.text(`CURP: ${patientInfo?.curp || 'N/A'}`, 14, 45)
        doc.text(`Fecha de reporte: ${format(new Date(), "PPP", { locale: es })}`, 14, 50)
        
        // Table
        autoTable(doc, {
            startY: 60,
            head: [['Fecha', 'Servicio', 'Fisioterapeuta', 'Diagnóstico y Notas']],
            body: records.map(record => [
                format(new Date(record.session_date), "dd/MM/yyyy"),
                record.service.name,
                record.physiotherapist.full_name,
                `${record.diagnosis ? 'DX: ' + record.diagnosis : ''}\n${record.treatment ? 'TX: ' + record.treatment : ''}`.trim()
            ]),
            headStyles: { fillColor: [37, 99, 235] },
            styles: { fontSize: 9, cellPadding: 5 },
            columnStyles: {
                3: { cellWidth: 80 }
            }
        })
        
        doc.save(`Clinova_Expediente_${patientInfo?.last_name}.pdf`)
    }

    if (loading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                </div>

                <div className="space-y-4 pt-8">
                    <Skeleton className="h-8 w-40" />
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Expediente Médico</h1>
                    <p className="text-muted-foreground mt-2">Historial de sesiones y tu progreso clínico</p>
                </div>
                <Button 
                    onClick={handleExportPDF}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={records.length === 0}
                >
                    <Download className="w-4 h-4" />
                    Exportar PDF
                </Button>
            </div>

            {/* Evolution Charts */}
            {measurements.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Mi Evolución</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {metricsToShow.map(metric => (
                            <Card key={metric} className="p-6">
                                <h3 className="font-semibold text-muted-foreground uppercase text-xs mb-4">
                                    {METRICS_LABELS[metric]}
                                </h3>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={getChartData(metric)}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis 
                                                dataKey="date" 
                                                fontSize={12} 
                                                tickLine={false} 
                                                axisLine={false}
                                                tick={{ fill: '#64748b' }}
                                            />
                                            <YAxis 
                                                fontSize={12} 
                                                tickLine={false} 
                                                axisLine={false}
                                                tick={{ fill: '#64748b' }}
                                                domain={metric === 'dolor' ? [0, 10] : ['auto', 'auto']}
                                            />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    borderRadius: '8px', 
                                                    border: 'none', 
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                                                }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="valor" 
                                                stroke={metric === 'dolor' ? '#ef4444' : '#3b82f6'} 
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: metric === 'dolor' ? '#ef4444' : '#3b82f6' }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <h2 className="text-xl font-bold text-foreground pt-4">Historial de Sesiones</h2>

            {records.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No hay registros médicos</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {records.map((record) => (
                        <div key={record.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg text-foreground">{record.service.name}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {format(new Date(record.session_date), "d 'de' MMMM, yyyy", { locale: es })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {record.physiotherapist.full_name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {record.diagnosis && (
                                        <div className="mb-3">
                                            <h4 className="text-sm font-semibold text-foreground mb-1">Diagnóstico</h4>
                                            <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                                        </div>
                                    )}

                                    {record.treatment && (
                                        <div className="mb-3">
                                            <h4 className="text-sm font-semibold text-foreground mb-1">Tratamiento</h4>
                                            <p className="text-sm text-muted-foreground">{record.treatment}</p>
                                        </div>
                                    )}

                                    {record.notes && record.notes !== 'null' && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground mb-1">Notas</h4>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{record.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

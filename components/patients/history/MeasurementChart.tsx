'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Measurement {
    id: string
    value: number
    measured_at: string
    notes?: string
}

interface EvolutionChartProps {
    data: Measurement[]
    title: string
    metricName: string
    color?: string
}

export default function EvolutionChart({
    data,
    title,
    metricName,
    color = '#2563eb'
}: EvolutionChartProps) {

    // Format data for chart
    const chartData = data.map(d => ({
        ...d,
        date: format(new Date(d.measured_at), 'dd MMM', { locale: es }),
        fullDate: format(new Date(d.measured_at), 'dd MMMM yyyy HH:mm', { locale: es }),
    }))

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>No hay datos registrados aún.</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center text-slate-400">
                    Sin mediciones
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Evolución en el tiempo</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={metricName === 'rom' ? [0, 180] : [0, 10]}
                                ticks={metricName === 'rom' ? [0, 45, 90, 135, 180] : [0, 2, 4, 6, 8, 10]}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={3}
                                activeDot={{ r: 6 }}
                                dot={{ r: 4, fill: 'white', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

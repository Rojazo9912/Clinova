'use client'

import { useState } from 'react'
import { addMeasurement, MeasurementData } from '@/lib/actions/clinical-measurements'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner' // Assuming sonner or similar toast
import EvolutionChart from './MeasurementChart'
import BodyMap, { BodyPoint } from './BodyMap'
import { PlusCircle, Activity, LayoutGrid, Ruler } from 'lucide-react'

const BODY_REGIONS = [
    { value: 'cervical', label: 'Cervical' },
    { value: 'lumbar', label: 'Lumbar' },
    { value: 'hombro_derecho', label: 'Hombro Derecho' },
    { value: 'hombro_izquierdo', label: 'Hombro Izquierdo' },
    { value: 'codo_derecho', label: 'Codo Derecho' },
    { value: 'codo_izquierdo', label: 'Codo Izquierdo' },
    { value: 'muñeca_derecha', label: 'Muñeca Derecha' },
    { value: 'muñeca_izquierda', label: 'Muñeca Izquierda' },
    { value: 'cadera_derecha', label: 'Cadera Derecha' },
    { value: 'cadera_izquierda', label: 'Cadera Izquierda' },
    { value: 'rodilla_derecha', label: 'Rodilla Derecha' },
    { value: 'rodilla_izquierda', label: 'Rodilla Izquierda' },
    { value: 'tobillo_derecho', label: 'Tobillo Derecho' },
    { value: 'tobillo_izquierdo', label: 'Tobillo Izquierdo' },
]

interface MeasurementLogProps {
    patientId: string
    initialHistory: any[]
}

export default function MeasurementLog({ patientId, initialHistory }: MeasurementLogProps) {
    const [view, setView] = useState<'charts' | 'bodymap' | 'rom'>('charts')
    const [metric, setMetric] = useState('dolor')
    const [value, setValue] = useState([5])
    const [notes, setNotes] = useState('')
    const [bodyPoints, setBodyPoints] = useState<BodyPoint[]>([])
    const [loading, setLoading] = useState(false)
    const [bodyRegion, setBodyRegion] = useState('cervical')
    const [romValue, setRomValue] = useState([90])

    const history = initialHistory || []

    // Filter history for current view
    const chartHistory = history.filter(h => h.metric === metric)
    const latestBodyMap = history.filter(h => h.metric === 'body_map').pop()?.data || []

    const handleSubmit = async () => {
        setLoading(true)
        try {
            let data: MeasurementData

            if (view === 'rom') {
                data = {
                    patient_id: patientId,
                    metric: 'rom',
                    value: romValue[0],
                    body_region: bodyRegion,
                    notes: notes,
                }
            } else if (view === 'bodymap') {
                if (bodyPoints.length === 0) {
                    toast?.error?.('Registra al menos un punto en el mapa') || alert('Registra al menos un punto en el mapa')
                    setLoading(false)
                    return
                }
                data = {
                    patient_id: patientId,
                    metric: 'body_map',
                    data: bodyPoints,
                    notes: notes,
                }
            } else {
                data = {
                    patient_id: patientId,
                    metric: metric as any,
                    value: value[0],
                    notes: notes,
                }
            }

            const result = await addMeasurement(data)

            if (result.success) {
                toast?.success?.('Medición guardada correctamente') || alert('Medición guardada correctamente')
                setNotes('')
                if (view === 'bodymap') setBodyPoints([])
            } else {
                toast?.error?.(result.message) || alert(result.message)
            }
        } catch (err) {
            toast?.error?.('Error al guardar') || alert('Error al guardar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">

            {/* View Toggle */}
            <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setView('charts')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'charts' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Activity className="w-4 h-4 inline mr-2" />
                    Gráficas
                </button>
                <button
                    onClick={() => setView('rom')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'rom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Ruler className="w-4 h-4 inline mr-2" />
                    ROM / Goniometría
                </button>
                <button
                    onClick={() => setView('bodymap')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'bodymap' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <LayoutGrid className="w-4 h-4 inline mr-2" />
                    Mapa Corporal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Input Column */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-blue-600" />
                            Nuevo Registro
                        </h3>

                        {view === 'charts' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Métrica</label>
                                    <Select value={metric} onValueChange={setMetric}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dolor">Nivel de Dolor (EVA)</SelectItem>
                                            <SelectItem value="movilidad">Movilidad / Flex</SelectItem>
                                            <SelectItem value="fuerza">Fuerza</SelectItem>
                                            <SelectItem value="flexibilidad">Flexibilidad</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-slate-700">Valor</label>
                                        <span className="text-2xl font-bold text-blue-600">{value[0]}/10</span>
                                    </div>
                                    <Slider
                                        value={value}
                                        onValueChange={setValue}
                                        max={10}
                                        step={1}
                                        className="py-4"
                                    />
                                    <p className="text-xs text-slate-500 text-center">
                                        {metric === 'dolor' ? (
                                            value[0] === 0 ? 'Sin dolor' : value[0] <= 3 ? 'Leve' : value[0] <= 7 ? 'Moderado' : 'Severo'
                                        ) : (
                                            value[0] === 0 ? 'Nulo' : value[0] <= 5 ? 'Limitado' : 'Bueno'
                                        )}
                                    </p>
                                </div>
                            </>
                        ) : view === 'rom' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Articulación</label>
                                    <Select value={bodyRegion} onValueChange={setBodyRegion}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BODY_REGIONS.map(r => (
                                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-slate-700">Grados (ROM)</label>
                                        <span className="text-2xl font-bold text-indigo-600">{romValue[0]}°</span>
                                    </div>
                                    <Slider
                                        value={romValue}
                                        onValueChange={setRomValue}
                                        max={180}
                                        step={5}
                                        className="py-4"
                                    />
                                    <p className="text-xs text-slate-500 text-center">
                                        {romValue[0] <= 45 ? 'Muy limitado' : romValue[0] <= 90 ? 'Limitado' : romValue[0] <= 135 ? 'Moderado' : 'Completo'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                                Toca las zonas en el mapa y asigna la intensidad.
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Notas (opcional)</label>
                            <Textarea
                                placeholder="Comentarios sobre el progreso..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="resize-none"
                            />
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar Registro'}
                        </Button>
                    </div>
                </div>

                {/* Visualization Column */}
                <div className="md:col-span-2 space-y-6">
                    {view === 'charts' ? (
                        <EvolutionChart
                            data={chartHistory}
                            title={`Evolución: ${metric.charAt(0).toUpperCase() + metric.slice(1)}`}
                            metricName={metric}
                            color={metric === 'dolor' ? '#ef4444' : metric === 'fuerza' ? '#16a34a' : '#2563eb'}
                        />
                    ) : view === 'rom' ? (
                        <EvolutionChart
                            data={history.filter(h => h.metric === 'rom' && h.body_region === bodyRegion)}
                            title={`ROM: ${BODY_REGIONS.find(r => r.value === bodyRegion)?.label || bodyRegion}`}
                            metricName="rom"
                            color="#6366f1"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                            {/* Input Map */}
                            <div className="h-full">
                                <h4 className="text-sm font-medium mb-2 text-center text-slate-500">Nuevo Registro</h4>
                                <BodyMap points={bodyPoints} onChange={setBodyPoints} />
                            </div>

                            {/* Latest Record Map */}
                            <div className="h-full opacity-75">
                                <h4 className="text-sm font-medium mb-2 text-center text-slate-500">Último Registrado</h4>
                                <BodyMap points={latestBodyMap} readOnly />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

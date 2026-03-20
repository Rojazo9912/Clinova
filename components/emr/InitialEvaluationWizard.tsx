'use client'

import { useState } from 'react'
import { createMedicalRecord } from '@/lib/actions/medical-records'
import { createTreatmentPlan } from '@/lib/actions/treatment-plans'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    patientId: string
    patientName?: string
    patientAge?: number
}

const STEPS = [
    { id: 1, title: 'Motivo de consulta', icon: '🩺' },
    { id: 2, title: 'Antecedentes', icon: '📋' },
    { id: 3, title: 'Exploración física', icon: '🔍' },
    { id: 4, title: 'Diagnóstico', icon: '📝' },
    { id: 5, title: 'Plan de tratamiento', icon: '🗓️' },
]

const CHRONIC_CONDITIONS = [
    'Diabetes mellitus', 'Hipertensión arterial', 'Obesidad',
    'Artritis / Artrosis', 'Osteoporosis', 'Cardiopatía',
    'EPOC / Asma', 'Hipotiroidismo', 'Depresión / Ansiedad', 'Otra',
]

const BODY_REGIONS = [
    'Columna cervical', 'Columna lumbar', 'Columna dorsal',
    'Hombro derecho', 'Hombro izquierdo', 'Codo derecho', 'Codo izquierdo',
    'Muñeca/Mano derecha', 'Muñeca/Mano izquierda',
    'Cadera derecha', 'Cadera izquierda',
    'Rodilla derecha', 'Rodilla izquierda',
    'Tobillo/Pie derecho', 'Tobillo/Pie izquierdo',
    'Múltiples zonas', 'Otro',
]

const FREQUENCIES = [
    { value: '1x_week', label: '1 vez/semana' },
    { value: '2x_week', label: '2 veces/semana' },
    { value: '3x_week', label: '3 veces/semana' },
    { value: 'daily', label: 'Diario' },
    { value: 'as_needed', label: 'Según evolución' },
]

export default function InitialEvaluationWizard({ isOpen, onClose, onSuccess, patientId, patientName, patientAge }: Props) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Step 1 — Chief complaint
    const [chiefComplaint, setChiefComplaint] = useState('')
    const [bodyRegion, setBodyRegion] = useState('')
    const [onsetDuration, setOnsetDuration] = useState('')
    const [painOnset, setPainOnset] = useState<'gradual' | 'sudden' | ''>('')
    const [worseAt, setWorseAt] = useState('')

    // Step 2 — Medical history
    const [chronicConditions, setChronicConditions] = useState<string[]>([])
    const [previousSurgeries, setPreviousSurgeries] = useState('')
    const [currentMedications, setCurrentMedications] = useState('')
    const [allergies, setAllergies] = useState('')
    const [previousPhysio, setPreviousPhysio] = useState<'yes' | 'no' | ''>('')

    // Step 3 — Physical exam
    const [initialPain, setInitialPain] = useState(5)
    const [posture, setPosture] = useState('')
    const [romNotes, setRomNotes] = useState('')
    const [strengthNotes, setStrengthNotes] = useState('')
    const [examFindings, setExamFindings] = useState('')

    // Step 4 — Diagnosis
    const [diagnosis, setDiagnosis] = useState('')
    const [goals, setGoals] = useState<string[]>([''])

    // Step 5 — Treatment plan
    const [planTitle, setPlanTitle] = useState('')
    const [totalSessions, setTotalSessions] = useState(12)
    const [frequency, setFrequency] = useState('3x_week')
    const [sessionPrice, setSessionPrice] = useState<number | ''>('')
    const [packagePrice, setPackagePrice] = useState<number | ''>('')
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])

    if (!isOpen) return null

    const initials = patientName ? patientName.split(' ').map(n => n[0]).slice(0, 2).join('') : '?'

    function toggleCondition(c: string) {
        setChronicConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
    }

    function addGoal() { setGoals(g => [...g, '']) }
    function removeGoal(i: number) { setGoals(g => g.filter((_, idx) => idx !== i)) }
    function updateGoal(i: number, v: string) { setGoals(g => g.map((x, idx) => idx === i ? v : x)) }

    function canProceed(): boolean {
        if (step === 1) return chiefComplaint.trim().length > 3 && bodyRegion !== ''
        if (step === 4) return diagnosis.trim().length > 3
        if (step === 5) return planTitle.trim().length > 2 && totalSessions > 0
        return true
    }

    async function handleFinish() {
        setLoading(true)
        try {
            // Build structured notes for the medical record
            const structuredNotes = [
                `MOTIVO DE CONSULTA:\n${chiefComplaint}`,
                `ZONA AFECTADA: ${bodyRegion}`,
                `INICIO: ${onsetDuration}${painOnset ? ` (${painOnset === 'gradual' ? 'inicio gradual' : 'inicio súbito'})` : ''}`,
                worseAt ? `EMPEORA CON: ${worseAt}` : '',
                chronicConditions.length > 0 ? `\nANTECEDENTES PATOLÓGICOS:\n${chronicConditions.join(', ')}` : '',
                previousSurgeries ? `CIRUGÍAS PREVIAS: ${previousSurgeries}` : '',
                currentMedications ? `MEDICAMENTOS: ${currentMedications}` : '',
                allergies ? `ALERGIAS: ${allergies}` : '',
                previousPhysio === 'yes' ? 'FISIOTERAPIA PREVIA: Sí' : '',
                `\nEXPLORACIÓN FÍSICA:`,
                `• Dolor inicial (EVA): ${initialPain}/10`,
                posture ? `• Postura: ${posture}` : '',
                romNotes ? `• ROM: ${romNotes}` : '',
                strengthNotes ? `• Fuerza: ${strengthNotes}` : '',
                examFindings ? `• Hallazgos: ${examFindings}` : '',
                `\nDIAGNÓSTICO FISIOTERAPÉUTICO:\n${diagnosis}`,
                goals.filter(g => g.trim()).length > 0 ? `\nOBJETIVOS DEL TRATAMIENTO:\n${goals.filter(g => g.trim()).map(g => `• ${g}`).join('\n')}` : '',
            ].filter(Boolean).join('\n')

            // Create medical record
            await createMedicalRecord({
                patient_id: patientId,
                diagnosis,
                treatment_plan: `Plan: ${planTitle} · ${totalSessions} sesiones · ${frequency}`,
                notes: structuredNotes,
            })

            // Estimate end date
            const start = new Date(startDate)
            const sessionsPerWeek = frequency === 'daily' ? 5 : frequency === '3x_week' ? 3 : frequency === '2x_week' ? 2 : 1
            const weeksNeeded = Math.ceil(totalSessions / sessionsPerWeek)
            start.setDate(start.getDate() + weeksNeeded * 7)
            const estimatedEnd = start.toISOString().split('T')[0]

            // Create treatment plan
            await createTreatmentPlan({
                patient_id: patientId,
                title: planTitle,
                diagnosis,
                total_sessions: totalSessions,
                frequency,
                session_price: sessionPrice !== '' ? Number(sessionPrice) : undefined,
                package_price: packagePrice !== '' ? Number(packagePrice) : undefined,
                start_date: startDate,
                estimated_end_date: estimatedEnd,
                goals: goals.filter(g => g.trim()).map((g, i) => ({
                    id: `goal_${i}`,
                    description: g,
                    achieved: false,
                })),
                notes: `Evaluación inicial realizada el ${new Date().toLocaleDateString('es-MX')}`,
            })

            toast.success('Expediente inicial creado exitosamente')
            onSuccess()
        } catch (err) {
            console.error(err)
            toast.error('Error al guardar el expediente')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                                {initials}
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-lg leading-tight">Primera Consulta</h2>
                                <p className="text-blue-100 text-xs">{patientName}{patientAge ? ` · ${patientAge} años` : ''}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center gap-1">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex items-center flex-1">
                                <button
                                    type="button"
                                    onClick={() => step > s.id ? setStep(s.id) : undefined}
                                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
                                        step === s.id
                                            ? 'bg-white text-blue-700 shadow-md'
                                            : step > s.id
                                                ? 'bg-white/20 text-white cursor-pointer hover:bg-white/30'
                                                : 'bg-white/10 text-white/50 cursor-default'
                                    }`}
                                >
                                    {step > s.id ? <Check className="w-3 h-3" /> : <span>{s.icon}</span>}
                                    <span className="hidden sm:inline truncate">{s.title}</span>
                                </button>
                                {i < STEPS.length - 1 && <div className="w-2 h-px bg-white/30 flex-shrink-0 mx-0.5" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">

                    {/* Step 1: Chief Complaint */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">¿Cuál es el motivo de consulta? *</label>
                                <textarea
                                    value={chiefComplaint}
                                    onChange={e => setChiefComplaint(e.target.value)}
                                    placeholder="Describe con detalle el problema principal del paciente..."
                                    rows={3}
                                    className="w-full px-3.5 py-3 border border-border rounded-xl text-sm bg-card text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">Zona afectada *</label>
                                <div className="flex flex-wrap gap-2">
                                    {BODY_REGIONS.map(r => (
                                        <button key={r} type="button" onClick={() => setBodyRegion(r)}
                                            className={`px-3 py-1.5 text-xs rounded-full border-2 font-medium transition ${bodyRegion === r ? 'bg-blue-600 text-white border-blue-600' : 'border-border text-muted-foreground hover:border-blue-400'}`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-1.5">Tiempo de evolución</label>
                                    <input value={onsetDuration} onChange={e => setOnsetDuration(e.target.value)}
                                        placeholder="Ej: 3 semanas, 6 meses..."
                                        className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-1.5">Tipo de inicio</label>
                                    <div className="flex gap-2">
                                        {[{v: 'gradual', l: '🌊 Gradual'}, {v: 'sudden', l: '⚡ Súbito'}].map(o => (
                                            <button key={o.v} type="button" onClick={() => setPainOnset(o.v as any)}
                                                className={`flex-1 py-2 text-xs font-medium rounded-xl border-2 transition ${painOnset === o.v ? 'bg-blue-600 text-white border-blue-600' : 'border-border text-muted-foreground hover:border-blue-400'}`}>
                                                {o.l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">¿Con qué empeora?</label>
                                <input value={worseAt} onChange={e => setWorseAt(e.target.value)}
                                    placeholder="Ej: Estar sentado, caminar, en las mañanas..."
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Medical History */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">Enfermedades crónicas</label>
                                <div className="flex flex-wrap gap-2">
                                    {CHRONIC_CONDITIONS.map(c => (
                                        <button key={c} type="button" onClick={() => toggleCondition(c)}
                                            className={`px-3 py-1.5 text-xs rounded-full border-2 font-medium transition ${chronicConditions.includes(c) ? 'bg-orange-500 text-white border-orange-500' : 'border-border text-muted-foreground hover:border-orange-400'}`}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Cirugías previas</label>
                                <input value={previousSurgeries} onChange={e => setPreviousSurgeries(e.target.value)}
                                    placeholder="Ej: Apendicectomía 2018, prótesis de cadera 2020..."
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Medicamentos actuales</label>
                                <input value={currentMedications} onChange={e => setCurrentMedications(e.target.value)}
                                    placeholder="Ej: Metformina 850mg, Enalapril 10mg..."
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Alergias</label>
                                <input value={allergies} onChange={e => setAllergies(e.target.value)}
                                    placeholder="Ej: Penicilina, AINEs, látex..."
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">¿Ha tenido fisioterapia previa?</label>
                                <div className="flex gap-3">
                                    {[{v: 'yes', l: '✅ Sí'}, {v: 'no', l: '❌ No'}].map(o => (
                                        <button key={o.v} type="button" onClick={() => setPreviousPhysio(o.v as any)}
                                            className={`flex-1 py-2.5 text-sm font-medium rounded-xl border-2 transition ${previousPhysio === o.v ? 'bg-blue-600 text-white border-blue-600' : 'border-border text-muted-foreground hover:border-blue-400'}`}>
                                            {o.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Physical Exam */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                                <label className="block text-sm font-semibold text-red-700 dark:text-red-400 mb-3">
                                    Dolor inicial (Escala EVA): <span className="text-2xl font-bold">{initialPain}/10</span>
                                </label>
                                <input type="range" min="0" max="10" value={initialPain}
                                    onChange={e => setInitialPain(parseInt(e.target.value))}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{ accentColor: initialPain <= 3 ? '#22c55e' : initialPain <= 6 ? '#eab308' : '#ef4444' }}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Sin dolor</span>
                                    <span className={`font-semibold ${initialPain <= 3 ? 'text-green-600' : initialPain <= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {initialPain <= 3 ? 'Leve' : initialPain <= 6 ? 'Moderado' : 'Severo'}
                                    </span>
                                    <span>Insoportable</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Postura y alineación</label>
                                <input value={posture} onChange={e => setPosture(e.target.value)}
                                    placeholder="Ej: Hipercifosis dorsal, escoliosis leve, adelantamiento de cabeza..."
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Rango de movimiento (ROM)</label>
                                <textarea value={romNotes} onChange={e => setRomNotes(e.target.value)}
                                    placeholder="Ej: Flexión lumbar limitada 60°, rotación cervical derecha dolorosa..."
                                    rows={2}
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Fuerza muscular</label>
                                <input value={strengthNotes} onChange={e => setStrengthNotes(e.target.value)}
                                    placeholder="Ej: Fuerza 4/5 en abductores de cadera bilateral..."
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Otros hallazgos / Pruebas especiales</label>
                                <textarea value={examFindings} onChange={e => setExamFindings(e.target.value)}
                                    placeholder="Ej: Lasègue positivo derecho a 45°, test de Ober positivo..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Diagnosis & Goals */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Diagnóstico fisioterapéutico *</label>
                                <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                                    placeholder="Ej: Síndrome facetario lumbar L4-L5 con contractura paravertebral bilateral y limitación funcional para AVD..."
                                    rows={4}
                                    className="w-full px-3.5 py-3 border border-border rounded-xl text-sm bg-card text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-foreground">Objetivos del tratamiento</label>
                                    <button type="button" onClick={addGoal} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                        + Agregar objetivo
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {goals.map((g, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                                            <input value={g} onChange={e => updateGoal(i, e.target.value)}
                                                placeholder={`Ej: Reducir EVA de ${initialPain} a ${Math.max(0, initialPain - 3)} en 4 semanas`}
                                                className="flex-1 px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            {goals.length > 1 && (
                                                <button type="button" onClick={() => removeGoal(i)} className="text-red-400 hover:text-red-600 transition text-lg leading-none">×</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Treatment Plan */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Nombre del plan *</label>
                                <input value={planTitle} onChange={e => setPlanTitle(e.target.value)}
                                    placeholder={`Ej: Rehabilitación ${bodyRegion || 'lumbar'} — ${patientName?.split(' ')[0] || 'Paciente'}`}
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-1.5">Total de sesiones *</label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {[8, 12, 16, 20, 24].map(n => (
                                            <button key={n} type="button" onClick={() => setTotalSessions(n)}
                                                className={`flex-1 min-w-[2.5rem] py-2 text-sm font-semibold rounded-xl border-2 transition ${totalSessions === n ? 'bg-blue-600 text-white border-blue-600' : 'border-border text-muted-foreground hover:border-blue-400'}`}>
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-1.5">Frecuencia</label>
                                    <select value={frequency} onChange={e => setFrequency(e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Fecha de inicio</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-1.5">Precio por sesión (MXN)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                        <input type="number" value={sessionPrice} onChange={e => setSessionPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                            placeholder="500"
                                            className="w-full pl-7 pr-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-1.5">Precio de paquete (MXN)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                        <input type="number" value={packagePrice} onChange={e => setPackagePrice(e.target.value === '' ? '' : Number(e.target.value))}
                                            placeholder={sessionPrice !== '' ? String(Number(sessionPrice) * totalSessions) : '0'}
                                            className="w-full pl-7 pr-3 py-2 border border-border rounded-xl text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Summary card */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 space-y-1">
                                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">📋 Resumen del expediente</h4>
                                <p className="text-xs text-blue-700 dark:text-blue-400">🩺 {chiefComplaint.slice(0, 60)}...</p>
                                <p className="text-xs text-blue-700 dark:text-blue-400">📍 {bodyRegion}</p>
                                <p className="text-xs text-blue-700 dark:text-blue-400">🔴 Dolor inicial: {initialPain}/10</p>
                                <p className="text-xs text-blue-700 dark:text-blue-400">🗓️ {totalSessions} sesiones · {FREQUENCIES.find(f => f.value === frequency)?.label}</p>
                                {goals.filter(g => g.trim()).length > 0 && (
                                    <p className="text-xs text-blue-700 dark:text-blue-400">🎯 {goals.filter(g => g.trim()).length} objetivo{goals.filter(g => g.trim()).length > 1 ? 's' : ''} definido{goals.filter(g => g.trim()).length > 1 ? 's' : ''}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer nav */}
                <div className="flex-shrink-0 border-t border-border px-6 py-4 flex items-center justify-between gap-3">
                    <button type="button" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition">
                        <ChevronLeft className="w-4 h-4" />
                        {step === 1 ? 'Cancelar' : 'Anterior'}
                    </button>

                    <div className="flex items-center gap-1.5">
                        {STEPS.map(s => (
                            <div key={s.id} className={`h-1.5 rounded-full transition-all ${s.id === step ? 'w-6 bg-blue-600' : s.id < step ? 'w-3 bg-blue-400' : 'w-3 bg-border'}`} />
                        ))}
                    </div>

                    {step < 5 ? (
                        <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-40">
                            Siguiente
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button type="button" onClick={handleFinish} disabled={loading || !canProceed()}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-40">
                            <Check className="w-4 h-4" />
                            {loading ? 'Guardando...' : 'Crear expediente'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

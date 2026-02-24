'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMedicalRecord } from '@/lib/actions/medical-records'
import { addMeasurement } from '@/lib/actions/clinical-measurements'
import { createTreatmentPlan } from '@/lib/actions/treatment-plans'
import { grantPortalAccess } from '@/lib/actions/patient-portal-access'
import {
    User, Stethoscope, Heart, Activity, ClipboardList, AlertTriangle,
    ChevronRight, ChevronLeft, Check, Plus, Trash2, Target, Globe
} from 'lucide-react'

interface IntakeEvaluationFormProps {
    patientId: string
    patientName: string
    patientAge?: number
    patientEmail?: string
    hasPortalAccess?: boolean
}

const BODY_AREAS = [
    'Cervical', 'Dorsal', 'Lumbar', 'Sacro/Coxis',
    'Hombro Der.', 'Hombro Izq.', 'Codo Der.', 'Codo Izq.',
    'Muñeca/Mano Der.', 'Muñeca/Mano Izq.',
    'Cadera Der.', 'Cadera Izq.', 'Rodilla Der.', 'Rodilla Izq.',
    'Tobillo/Pie Der.', 'Tobillo/Pie Izq.', 'ATM', 'Otro'
]

const COMMON_CONDITIONS = [
    'Diabetes', 'Hipertensión', 'Cardiopatía', 'Asma/EPOC',
    'Osteoporosis', 'Artritis', 'Fibromialgia', 'Hipotiroidismo',
    'Ninguna'
]

const SPECIAL_TESTS = [
    { name: 'Lasègue', area: 'lumbar' },
    { name: 'Slump Test', area: 'lumbar' },
    { name: 'Thomas', area: 'cadera' },
    { name: 'Patrick/FABER', area: 'cadera' },
    { name: 'McMurray', area: 'rodilla' },
    { name: 'Cajón anterior', area: 'rodilla' },
    { name: 'Cajón posterior', area: 'rodilla' },
    { name: 'Varo/Valgo', area: 'rodilla' },
    { name: 'Neer', area: 'hombro' },
    { name: 'Hawkins-Kennedy', area: 'hombro' },
    { name: 'Jobe', area: 'hombro' },
    { name: 'Speed', area: 'hombro' },
    { name: 'Phalen', area: 'muñeca' },
    { name: 'Tinel', area: 'muñeca' },
    { name: 'Thompson', area: 'tobillo' },
    { name: 'Cajón anterior tobillo', area: 'tobillo' },
]

type Step = 'motivo' | 'antecedentes' | 'exploracion' | 'valoracion' | 'plan'

export default function IntakeEvaluationForm({ patientId, patientName, patientAge, patientEmail, hasPortalAccess }: IntakeEvaluationFormProps) {
    const router = useRouter()
    const [step, setStep] = useState<Step>('motivo')
    const [loading, setLoading] = useState(false)
    const [grantAccess, setGrantAccess] = useState(!hasPortalAccess && !!patientEmail)

    // Step 1: Motivo de consulta
    const [chiefComplaint, setChiefComplaint] = useState('')
    const [painArea, setPainArea] = useState('')
    const [symptomOnset, setSymptomOnset] = useState('') // agudo, subagudo, crónico
    const [onsetDate, setOnsetDate] = useState('')
    const [symptomType, setSymptomType] = useState('') // constante, intermitente, nocturno
    const [aggravatingFactors, setAggravatingFactors] = useState('')
    const [relievingFactors, setRelievingFactors] = useState('')
    const [previousTreatment, setPreviousTreatment] = useState('')
    const [referredBy, setReferredBy] = useState('')

    // Step 2: Antecedentes
    const [conditions, setConditions] = useState<string[]>([])
    const [surgeries, setSurgeries] = useState('')
    const [medications, setMedications] = useState('')
    const [allergies, setAllergies] = useState('')
    const [occupation, setOccupation] = useState('')
    const [physicalActivity, setPhysicalActivity] = useState('sedentario') // sedentario, leve, moderado, activo
    const [smoking, setSmoking] = useState(false)
    const [familyHistory, setFamilyHistory] = useState('')

    // Step 3: Exploración física
    const [posture, setPosture] = useState('')
    const [palpation, setPalpation] = useState('')
    const [specialTests, setSpecialTests] = useState<Array<{ test: string, result: 'positivo' | 'negativo' | 'no_realizado' }>>([])
    const [observations, setObservations] = useState('')

    // Step 4: Valoración
    const [painLevel, setPainLevel] = useState(5)
    const [mobilityLevel, setMobilityLevel] = useState(5)
    const [strengthLevel, setStrengthLevel] = useState(5)
    const [functionalLevel, setFunctionalLevel] = useState(5) // 0=dependiente, 10=independiente

    // Step 5: Plan
    const [diagnosis, setDiagnosis] = useState('')
    const [createPlan, setCreatePlan] = useState(true)
    const [planTitle, setPlanTitle] = useState('')
    const [totalSessions, setTotalSessions] = useState(10)
    const [frequency, setFrequency] = useState('2x_semana')
    const [packagePrice, setPackagePrice] = useState('')
    const [goals, setGoals] = useState<Array<{ id: string, description: string }>>([])
    const [newGoal, setNewGoal] = useState('')
    const [treatmentApproach, setTreatmentApproach] = useState('')

    const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
        { key: 'motivo', label: 'Motivo', icon: <Stethoscope className="w-4 h-4" /> },
        { key: 'antecedentes', label: 'Antecedentes', icon: <Heart className="w-4 h-4" /> },
        { key: 'exploracion', label: 'Exploración', icon: <User className="w-4 h-4" /> },
        { key: 'valoracion', label: 'Valoración', icon: <Activity className="w-4 h-4" /> },
        { key: 'plan', label: 'Plan', icon: <ClipboardList className="w-4 h-4" /> },
    ]

    const currentIdx = steps.findIndex(s => s.key === step)

    const toggleCondition = (condition: string) => {
        if (condition === 'Ninguna') {
            setConditions(conditions.includes('Ninguna') ? [] : ['Ninguna'])
            return
        }
        setConditions(prev =>
            prev.filter(c => c !== 'Ninguna').includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev.filter(c => c !== 'Ninguna'), condition]
        )
    }

    const addGoal = () => {
        if (!newGoal.trim()) return
        setGoals([...goals, { id: crypto.randomUUID(), description: newGoal.trim() }])
        setNewGoal('')
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // Build structured notes
            const structuredNotes = `
=== EVALUACIÓN INICIAL ===
Paciente: ${patientName}${patientAge ? ` (${patientAge} años)` : ''}
Fecha: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
${referredBy ? `Referido por: ${referredBy}` : ''}

--- MOTIVO DE CONSULTA ---
${chiefComplaint}
Zona: ${painArea}
Inicio: ${symptomOnset} ${onsetDate ? `(${onsetDate})` : ''}
Tipo: ${symptomType}
${aggravatingFactors ? `Factores agravantes: ${aggravatingFactors}` : ''}
${relievingFactors ? `Factores atenuantes: ${relievingFactors}` : ''}
${previousTreatment ? `Tratamiento previo: ${previousTreatment}` : ''}

--- ANTECEDENTES ---
Ocupación: ${occupation || 'No especificado'}
Actividad física: ${physicalActivity}
Tabaco: ${smoking ? 'Sí' : 'No'}
Patologías: ${conditions.length > 0 ? conditions.join(', ') : 'Ninguna reportada'}
${surgeries ? `Cirugías previas: ${surgeries}` : ''}
${medications ? `Medicamentos: ${medications}` : ''}
${allergies ? `Alergias: ${allergies}` : ''}
${familyHistory ? `Antecedentes familiares: ${familyHistory}` : ''}

--- EXPLORACIÓN FÍSICA ---
${posture ? `Postura: ${posture}` : ''}
${palpation ? `Palpación: ${palpation}` : ''}
${specialTests.filter(t => t.result !== 'no_realizado').length > 0 ?
                    `Pruebas especiales:\n${specialTests.filter(t => t.result !== 'no_realizado').map(t => `  - ${t.test}: ${t.result === 'positivo' ? '(+)' : '(-)'}`).join('\n')}` : ''}
${observations ? `Observaciones: ${observations}` : ''}

--- VALORACIÓN ---
EVA Dolor: ${painLevel}/10
Movilidad: ${mobilityLevel}/10
Fuerza: ${strengthLevel}/10
Funcionalidad: ${functionalLevel}/10
`.trim()

            // 1. Save medical record
            await createMedicalRecord({
                patient_id: patientId,
                diagnosis: diagnosis,
                treatment_plan: treatmentApproach,
                notes: structuredNotes,
            })

            // 2. Save clinical measurements
            await addMeasurement({ patient_id: patientId, metric: 'dolor', value: painLevel, notes: 'Evaluación inicial' })
            await addMeasurement({ patient_id: patientId, metric: 'movilidad', value: mobilityLevel, notes: 'Evaluación inicial' })
            await addMeasurement({ patient_id: patientId, metric: 'fuerza', value: strengthLevel, notes: 'Evaluación inicial' })

            // 3. Create treatment plan if requested
            if (createPlan && planTitle) {
                await createTreatmentPlan({
                    patient_id: patientId,
                    title: planTitle,
                    diagnosis: diagnosis,
                    total_sessions: totalSessions,
                    frequency: frequency,
                    package_price: packagePrice ? parseFloat(packagePrice) : undefined,
                    start_date: new Date().toISOString().split('T')[0],
                    goals: goals.map(g => ({
                        id: g.id,
                        description: g.description,
                        achieved: false,
                    })),
                    notes: treatmentApproach,
                })
            }

            // 4. Grant portal access if requested
            if (grantAccess && patientEmail && !hasPortalAccess) {
                await grantPortalAccess(patientId)
            }

            router.push(`/dashboard/patients/${patientId}`)
            router.refresh()
        } catch (error) {
            console.error('Error saving intake evaluation:', error)
            alert('Error al guardar la evaluación')
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "mt-1 block w-full rounded-lg border border-slate-300 shadow-sm p-2.5 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                {steps.map((s, i) => (
                    <button
                        key={s.key}
                        onClick={() => setStep(s.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                            step === s.key
                                ? 'bg-blue-100 text-blue-700'
                                : i < currentIdx
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-slate-400 hover:bg-slate-50'
                        }`}
                    >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            step === s.key
                                ? 'bg-blue-600 text-white'
                                : i < currentIdx
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-200 text-slate-500'
                        }`}>
                            {i < currentIdx ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <span className="hidden md:inline">{s.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">

                    {/* STEP 1: Motivo de Consulta */}
                    {step === 'motivo' && (
                        <>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Motivo de Consulta</h3>
                                <p className="text-sm text-slate-500">¿Por qué viene el paciente? ¿Qué le duele?</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Motivo principal *</label>
                                <textarea
                                    value={chiefComplaint}
                                    onChange={(e) => setChiefComplaint(e.target.value)}
                                    rows={3}
                                    placeholder='Ej: "Dolor en zona lumbar que se irradia a pierna derecha desde hace 2 semanas, inicio tras cargar objeto pesado"'
                                    className={inputClass + " resize-none"}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Zona afectada</label>
                                    <select value={painArea} onChange={(e) => setPainArea(e.target.value)} className={inputClass}>
                                        <option value="">Seleccionar zona</option>
                                        {BODY_AREAS.map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Tipo de inicio</label>
                                    <select value={symptomOnset} onChange={(e) => setSymptomOnset(e.target.value)} className={inputClass}>
                                        <option value="">Seleccionar</option>
                                        <option value="agudo">Agudo (&lt; 2 semanas)</option>
                                        <option value="subagudo">Subagudo (2-12 semanas)</option>
                                        <option value="cronico">Crónico (&gt; 12 semanas)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Fecha aproximada de inicio</label>
                                    <input type="date" value={onsetDate} onChange={(e) => setOnsetDate(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Comportamiento del dolor</label>
                                    <select value={symptomType} onChange={(e) => setSymptomType(e.target.value)} className={inputClass}>
                                        <option value="">Seleccionar</option>
                                        <option value="constante">Constante</option>
                                        <option value="intermitente">Intermitente</option>
                                        <option value="nocturno">Predominio nocturno</option>
                                        <option value="matutino">Rigidez matutina</option>
                                        <option value="actividad">Solo con actividad</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">¿Qué lo empeora? (factores agravantes)</label>
                                <input value={aggravatingFactors} onChange={(e) => setAggravatingFactors(e.target.value)} placeholder="Ej: sentarse mucho, cargar peso, subir escaleras..." className={inputClass} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">¿Qué lo mejora? (factores atenuantes)</label>
                                <input value={relievingFactors} onChange={(e) => setRelievingFactors(e.target.value)} placeholder="Ej: reposo, calor, medicamento, posición..." className={inputClass} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Tratamiento previo</label>
                                    <input value={previousTreatment} onChange={(e) => setPreviousTreatment(e.target.value)} placeholder="Ej: Fisioterapia, quiropráctico, medicamentos..." className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Referido por</label>
                                    <input value={referredBy} onChange={(e) => setReferredBy(e.target.value)} placeholder="Dr. nombre, autorreferido..." className={inputClass} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* STEP 2: Antecedentes */}
                    {step === 'antecedentes' && (
                        <>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Antecedentes</h3>
                                <p className="text-sm text-slate-500">Historia médica, hábitos y estilo de vida</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Patologías conocidas</label>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_CONDITIONS.map(condition => (
                                        <button
                                            key={condition}
                                            type="button"
                                            onClick={() => toggleCondition(condition)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                                                conditions.includes(condition)
                                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {condition}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Cirugías previas</label>
                                <input value={surgeries} onChange={(e) => setSurgeries(e.target.value)} placeholder="Ej: Artroscopia rodilla der. (2022), Apendicectomía (2018)..." className={inputClass} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Medicamentos actuales</label>
                                    <input value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="Ej: Ibuprofeno 400mg, Omeprazol..." className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Alergias</label>
                                    <input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Ej: Penicilina, AINES, Ninguna..." className={inputClass} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Ocupación</label>
                                    <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Ej: Oficinista, albañil, ama de casa..." className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nivel de actividad física</label>
                                    <select value={physicalActivity} onChange={(e) => setPhysicalActivity(e.target.value)} className={inputClass}>
                                        <option value="sedentario">Sedentario</option>
                                        <option value="leve">Leve (camina)</option>
                                        <option value="moderado">Moderado (ejercicio 2-3x/sem)</option>
                                        <option value="activo">Activo (ejercicio diario)</option>
                                        <option value="deportista">Deportista</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={smoking} onChange={(e) => setSmoking(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                                    <span className="text-sm text-slate-700">Tabaquismo</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Antecedentes familiares relevantes</label>
                                <input value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} placeholder="Ej: Madre con artritis reumatoide, padre con diabetes..." className={inputClass} />
                            </div>
                        </>
                    )}

                    {/* STEP 3: Exploración Física */}
                    {step === 'exploracion' && (
                        <>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Exploración Física</h3>
                                <p className="text-sm text-slate-500">Hallazgos de la evaluación manual y visual</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Evaluación postural</label>
                                <textarea
                                    value={posture}
                                    onChange={(e) => setPosture(e.target.value)}
                                    rows={2}
                                    placeholder="Ej: Hiperlordosis lumbar, hombros protruidos, cabeza adelantada..."
                                    className={inputClass + " resize-none"}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Palpación</label>
                                <textarea
                                    value={palpation}
                                    onChange={(e) => setPalpation(e.target.value)}
                                    rows={2}
                                    placeholder="Ej: Contractura paravertebral L4-L5, punto gatillo en piriforme der..."
                                    className={inputClass + " resize-none"}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Pruebas Especiales
                                    <span className="text-xs text-slate-400 ml-2">(toca para marcar resultado)</span>
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {SPECIAL_TESTS.map(test => {
                                        const current = specialTests.find(t => t.test === test.name)
                                        const result = current?.result || 'no_realizado'
                                        return (
                                            <button
                                                key={test.name}
                                                type="button"
                                                onClick={() => {
                                                    const next = result === 'no_realizado' ? 'positivo' : result === 'positivo' ? 'negativo' : 'no_realizado'
                                                    if (next === 'no_realizado') {
                                                        setSpecialTests(specialTests.filter(t => t.test !== test.name))
                                                    } else {
                                                        setSpecialTests([
                                                            ...specialTests.filter(t => t.test !== test.name),
                                                            { test: test.name, result: next }
                                                        ])
                                                    }
                                                }}
                                                className={`px-3 py-2 rounded-lg text-sm text-left border transition ${
                                                    result === 'positivo' ? 'bg-red-50 border-red-300 text-red-700' :
                                                    result === 'negativo' ? 'bg-green-50 border-green-300 text-green-700' :
                                                    'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                <span className="font-medium">{test.name}</span>
                                                <span className="text-xs ml-1">
                                                    {result === 'positivo' ? '(+)' : result === 'negativo' ? '(-)' : ''}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Observaciones adicionales</label>
                                <textarea
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    rows={2}
                                    placeholder="Marcha, balance, coordinación, hallazgos relevantes..."
                                    className={inputClass + " resize-none"}
                                />
                            </div>
                        </>
                    )}

                    {/* STEP 4: Valoración */}
                    {step === 'valoracion' && (
                        <>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Valoración Funcional</h3>
                                <p className="text-sm text-slate-500">Escalas de referencia para seguimiento de evolución</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pain */}
                                <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-semibold text-red-800">Dolor (EVA)</label>
                                        <span className="text-2xl font-bold text-red-600">{painLevel}/10</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="10" value={painLevel}
                                        onChange={(e) => setPainLevel(parseInt(e.target.value))}
                                        className="w-full accent-red-500"
                                    />
                                    <div className="flex justify-between text-xs text-red-400 mt-1">
                                        <span>Sin dolor</span>
                                        <span>Máximo dolor</span>
                                    </div>
                                    <p className="text-center text-sm mt-2 font-medium text-red-700">
                                        {painLevel === 0 ? 'Sin dolor' : painLevel <= 3 ? 'Leve' : painLevel <= 7 ? 'Moderado' : 'Severo'}
                                    </p>
                                </div>

                                {/* Mobility */}
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-semibold text-blue-800">Movilidad</label>
                                        <span className="text-2xl font-bold text-blue-600">{mobilityLevel}/10</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="10" value={mobilityLevel}
                                        onChange={(e) => setMobilityLevel(parseInt(e.target.value))}
                                        className="w-full accent-blue-500"
                                    />
                                    <div className="flex justify-between text-xs text-blue-400 mt-1">
                                        <span>Nula</span>
                                        <span>Completa</span>
                                    </div>
                                    <p className="text-center text-sm mt-2 font-medium text-blue-700">
                                        {mobilityLevel <= 3 ? 'Muy limitada' : mobilityLevel <= 5 ? 'Limitada' : mobilityLevel <= 7 ? 'Moderada' : 'Completa'}
                                    </p>
                                </div>

                                {/* Strength */}
                                <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-semibold text-green-800">Fuerza Muscular</label>
                                        <span className="text-2xl font-bold text-green-600">{strengthLevel}/10</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="10" value={strengthLevel}
                                        onChange={(e) => setStrengthLevel(parseInt(e.target.value))}
                                        className="w-full accent-green-500"
                                    />
                                    <div className="flex justify-between text-xs text-green-400 mt-1">
                                        <span>Sin fuerza</span>
                                        <span>Fuerza normal</span>
                                    </div>
                                    <p className="text-center text-sm mt-2 font-medium text-green-700">
                                        {strengthLevel <= 3 ? 'Débil' : strengthLevel <= 5 ? 'Disminuida' : strengthLevel <= 7 ? 'Moderada' : 'Fuerte'}
                                    </p>
                                </div>

                                {/* Functional Level */}
                                <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-semibold text-purple-800">Funcionalidad</label>
                                        <span className="text-2xl font-bold text-purple-600">{functionalLevel}/10</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="10" value={functionalLevel}
                                        onChange={(e) => setFunctionalLevel(parseInt(e.target.value))}
                                        className="w-full accent-purple-500"
                                    />
                                    <div className="flex justify-between text-xs text-purple-400 mt-1">
                                        <span>Dependiente</span>
                                        <span>Independiente</span>
                                    </div>
                                    <p className="text-center text-sm mt-2 font-medium text-purple-700">
                                        {functionalLevel <= 3 ? 'Limitación severa' : functionalLevel <= 5 ? 'Limitación moderada' : functionalLevel <= 7 ? 'Limitación leve' : 'Funcional'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* STEP 5: Plan de Tratamiento */}
                    {step === 'plan' && (
                        <>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Diagnóstico y Plan</h3>
                                <p className="text-sm text-slate-500">Conclusión clínica y plan de acción</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Diagnóstico fisioterapéutico *</label>
                                <textarea
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                    rows={2}
                                    placeholder="Ej: Lumbalgia mecánica con radiculopatía L5 derecha secundaria a protrusión discal"
                                    className={inputClass + " resize-none"}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Enfoque de tratamiento</label>
                                <textarea
                                    value={treatmentApproach}
                                    onChange={(e) => setTreatmentApproach(e.target.value)}
                                    rows={3}
                                    placeholder="Ej: Fase 1 (sem 1-2): control del dolor con electroterapia y terapia manual. Fase 2 (sem 3-4): ejercicios de estabilización lumbar. Fase 3 (sem 5-6): fortalecimiento funcional y prevención de recaídas."
                                    className={inputClass + " resize-none"}
                                />
                            </div>

                            {/* Create Treatment Plan */}
                            <div className={`rounded-xl p-5 border-2 transition ${createPlan ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                                <label className="flex items-center gap-3 cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        checked={createPlan}
                                        onChange={(e) => setCreatePlan(e.target.checked)}
                                        className="w-5 h-5 rounded text-emerald-600"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-slate-900">Crear Plan de Tratamiento con Paquete</span>
                                        <p className="text-xs text-slate-500">Define sesiones, precio y objetivos medibles</p>
                                    </div>
                                </label>

                                {createPlan && (
                                    <div className="space-y-4 pt-2 border-t border-emerald-200">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Nombre del plan *</label>
                                            <input
                                                value={planTitle}
                                                onChange={(e) => setPlanTitle(e.target.value)}
                                                placeholder="Ej: Rehabilitación Lumbar"
                                                className={inputClass}
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700">Sesiones</label>
                                                <input
                                                    type="number" min="1" max="100"
                                                    value={totalSessions}
                                                    onChange={(e) => setTotalSessions(parseInt(e.target.value) || 1)}
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700">Frecuencia</label>
                                                <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={inputClass}>
                                                    <option value="diario">Diario</option>
                                                    <option value="2x_semana">2x por semana</option>
                                                    <option value="3x_semana">3x por semana</option>
                                                    <option value="semanal">Semanal</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700">Precio paquete</label>
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    value={packagePrice}
                                                    onChange={(e) => setPackagePrice(e.target.value)}
                                                    placeholder="$0.00"
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        {/* Goals */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <Target className="w-3.5 h-3.5 inline mr-1" />
                                                Objetivos medibles
                                            </label>
                                            {goals.length > 0 && (
                                                <div className="space-y-1.5 mb-2">
                                                    {goals.map(goal => (
                                                        <div key={goal.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-emerald-200">
                                                            <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                            <span className="text-sm flex-1">{goal.description}</span>
                                                            <button type="button" onClick={() => setGoals(goals.filter(g => g.id !== goal.id))} className="text-slate-400 hover:text-red-500">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <input
                                                    value={newGoal}
                                                    onChange={(e) => setNewGoal(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGoal() } }}
                                                    placeholder="Ej: Reducir EVA a 3 o menos"
                                                    className={inputClass + " flex-1"}
                                                />
                                                <button type="button" onClick={addGoal} className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Portal Access */}
                            {patientEmail && !hasPortalAccess && (
                                <div className={`rounded-xl p-5 border-2 transition ${grantAccess ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={grantAccess}
                                            onChange={(e) => setGrantAccess(e.target.checked)}
                                            className="w-5 h-5 rounded text-blue-600"
                                        />
                                        <div>
                                            <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-blue-500" />
                                                Activar Portal del Paciente
                                            </span>
                                            <p className="text-xs text-slate-500">
                                                Se enviará un correo a <strong>{patientEmail}</strong> con sus credenciales de acceso al portal
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}

                            {hasPortalAccess && (
                                <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <span className="text-sm font-medium text-emerald-800">Portal del paciente activo</span>
                                        <p className="text-xs text-emerald-600">El paciente ya tiene acceso al portal</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Navigation */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
                    <button
                        onClick={() => setStep(steps[currentIdx - 1]?.key || step)}
                        disabled={currentIdx === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </button>

                    {currentIdx < steps.length - 1 ? (
                        <button
                            onClick={() => setStep(steps[currentIdx + 1].key)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !chiefComplaint || !diagnosis}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar Evaluación'}
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

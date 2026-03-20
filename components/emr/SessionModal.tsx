'use client'

import { useState, useEffect, useRef } from 'react'
import { createTherapySession, getTherapySessions } from '@/lib/actions/medical-records'
import { getNoteTemplates, NoteTemplate } from '@/lib/actions/note-templates'
import { getExercises, assignExerciseToPatient, Exercise } from '@/lib/actions/exercises'
import { addMeasurement } from '@/lib/actions/clinical-measurements'
import { getActivePlanForPatient, incrementPlanSession } from '@/lib/actions/treatment-plans'
import { X, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface SessionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    patientId: string
    patientName?: string
    patientAge?: number
}

const PROGRESS_OPTIONS = [
    { value: 1, emoji: '😞', label: 'Sin avance', accent: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: '#fca5a5' },
    { value: 2, emoji: '😐', label: 'Leve', accent: '#f97316', bg: 'rgba(249,115,22,0.08)', border: '#fdba74' },
    { value: 3, emoji: '🙂', label: 'Moderado', accent: '#eab308', bg: 'rgba(234,179,8,0.08)', border: '#fde047' },
    { value: 4, emoji: '😊', label: 'Bueno', accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: '#93c5fd' },
    { value: 5, emoji: '🌟', label: 'Excelente', accent: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: '#86efac' },
]

const DURATIONS = [30, 45, 60, 90]
const FREQUENCIES = [
    { value: 'daily', label: 'Diario' },
    { value: '3x_week', label: '3x/sem' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'as_needed', label: 'C/necesidad' },
]

export default function SessionModal({ isOpen, onClose, onSuccess, patientId, patientName, patientAge }: SessionModalProps) {
    const [loading, setLoading] = useState(false)
    const [templates, setTemplates] = useState<NoteTemplate[]>([])
    const [notes, setNotes] = useState('')
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [exerciseSearch, setExerciseSearch] = useState('')
    const [selectedExercises, setSelectedExercises] = useState<Array<{ exercise_id: string, frequency: string }>>([])
    const [showExercises, setShowExercises] = useState(false)
    const [showMetrics, setShowMetrics] = useState(false)
    const [showPrevSession, setShowPrevSession] = useState(false)
    const [activePlan, setActivePlan] = useState<any>(null)
    const [linkToPlan, setLinkToPlan] = useState(true)
    const [progressRating, setProgressRating] = useState(3)
    const [pain, setPain] = useState<number | null>(null)
    const [mobility, setMobility] = useState<number | null>(null)
    const [strength, setStrength] = useState<number | null>(null)
    const [lastSession, setLastSession] = useState<any>(null)
    const [duration, setDuration] = useState(60)
    const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 16))
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const selectedProgress = PROGRESS_OPTIONS.find(p => p.value === progressRating)!

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                getNoteTemplates().then(d => setTemplates(d as NoteTemplate[])),
                getExercises().then(d => setExercises(d as Exercise[])),
                getActivePlanForPatient(patientId).then(setActivePlan),
                getTherapySessions(patientId).then(sessions => setLastSession((sessions as any[])?.[0] ?? null))
            ])
            // Reset
            setNotes(''); setSelectedExercises([]); setProgressRating(3)
            setPain(null); setMobility(null); setStrength(null)
            setSessionDate(new Date().toISOString().slice(0, 16))
            setShowExercises(false); setShowMetrics(false); setShowPrevSession(false)
            setExerciseSearch('')
        }
    }, [isOpen, patientId])

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current
        if (!ta) return
        ta.style.height = 'auto'
        ta.style.height = `${Math.max(120, ta.scrollHeight)}px`
    }, [notes])

    function applyTemplate(id: string) {
        const t = templates.find(t => t.id === id)
        if (!t) return
        let content = t.content
        const vars: Record<string, string> = {
            patient_name: patientName || '[Paciente]',
            patient_age: patientAge?.toString() || '[Edad]',
            date: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
            therapist_name: '[Fisioterapeuta]', service: '[Tratamiento]', session_number: '1'
        }
        Object.entries(vars).forEach(([k, v]) => { content = content.replace(new RegExp(`\\{${k}\\}`, 'g'), v) })
        setNotes(content)
        textareaRef.current?.focus()
    }

    function toggleExercise(id: string) {
        const exists = selectedExercises.find(e => e.exercise_id === id)
        setSelectedExercises(exists
            ? selectedExercises.filter(e => e.exercise_id !== id)
            : [...selectedExercises, { exercise_id: id, frequency: 'daily' }]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!notes.trim()) { toast.error('Las notas son requeridas'); return }
        setLoading(true)
        try {
            await createTherapySession({ patient_id: patientId, session_date: sessionDate, duration_minutes: duration, notes, exercises: [], progress_rating: progressRating })
            await Promise.all([
                ...selectedExercises.map(ex => assignExerciseToPatient({ patient_id: patientId, exercise_id: ex.exercise_id, frequency: ex.frequency }).catch(() => {})),
                pain !== null ? addMeasurement({ patient_id: patientId, metric: 'dolor', value: pain }) : Promise.resolve(),
                mobility !== null ? addMeasurement({ patient_id: patientId, metric: 'movilidad', value: mobility }) : Promise.resolve(),
                strength !== null ? addMeasurement({ patient_id: patientId, metric: 'fuerza', value: strength }) : Promise.resolve(),
            ])
            if (activePlan && linkToPlan) await incrementPlanSession(activePlan.id)
            toast.success('Sesión guardada exitosamente')
            onSuccess()
        } catch { toast.error('Error al guardar la sesión') }
        finally { setLoading(false) }
    }

    if (!isOpen) return null

    const initials = patientName ? patientName.split(' ').map(n => n[0]).slice(0, 2).join('') : '?'
    const filteredExercises = exercises.filter(e =>
        !exerciseSearch || e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) || e.category?.toLowerCase().includes(exerciseSearch.toLowerCase())
    )

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full sm:max-w-xl max-h-[96vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-all"
                style={{ background: 'var(--card, #1a1a2e)' }}
            >
                {/* Gradient header that adapts to progress color */}
                <div
                    className="flex-shrink-0 px-5 pt-5 pb-4 transition-colors duration-500"
                    style={{ background: `linear-gradient(135deg, ${selectedProgress.accent}22 0%, transparent 100%)`, borderBottom: `1px solid ${selectedProgress.border}44` }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            {/* Patient avatar */}
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                style={{ background: `linear-gradient(135deg, ${selectedProgress.accent}, ${selectedProgress.accent}88)` }}
                            >
                                {initials}
                            </div>
                            <div>
                                <h2 className="font-bold text-foreground leading-tight">
                                    {patientName || 'Paciente'}{patientAge ? <span className="text-muted-foreground font-normal text-sm"> · {patientAge}a</span> : ''}
                                </h2>
                                <p className="text-xs text-muted-foreground">Nueva sesión de terapia</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition flex-shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Active plan pill */}
                    {activePlan && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <span
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                                style={{ background: `${selectedProgress.accent}18`, color: selectedProgress.accent, border: `1px solid ${selectedProgress.border}` }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: selectedProgress.accent }} />
                                {activePlan.title} · Sesión {(activePlan.completed_sessions || 0) + 1}/{activePlan.total_sessions}
                            </span>
                            <label className="flex items-center gap-1 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition">
                                <input type="checkbox" checked={linkToPlan} onChange={e => setLinkToPlan(e.target.checked)} className="w-3 h-3 rounded" />
                                Contar
                            </label>
                        </div>
                    )}
                </div>

                {/* Scrollable form body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="px-5 py-4 space-y-4">

                        {/* Date + Duration row */}
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Fecha y hora</label>
                                <input
                                    type="datetime-local"
                                    value={sessionDate}
                                    onChange={e => setSessionDate(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-card text-foreground focus:ring-2 focus:outline-none transition"
                                    style={{ '--tw-ring-color': selectedProgress.accent } as any}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Duración</label>
                                <div className="flex gap-1">
                                    {DURATIONS.map(d => (
                                        <button key={d} type="button" onClick={() => setDuration(d)}
                                            className="px-2.5 py-2 text-xs font-semibold rounded-xl border transition-all"
                                            style={duration === d
                                                ? { background: selectedProgress.accent, color: '#fff', borderColor: selectedProgress.accent }
                                                : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
                                            }>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Previous session accordion */}
                        {lastSession && (
                            <button type="button" onClick={() => setShowPrevSession(!showPrevSession)}
                                className="w-full text-left px-3 py-2 rounded-xl border border-border hover:bg-muted/50 transition group">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition">
                                        🕐 Sesión anterior · {new Date(lastSession.session_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    {showPrevSession ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                                </div>
                                {showPrevSession && (
                                    <p className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto border-t border-border pt-2">
                                        {lastSession.notes || 'Sin notas registradas.'}
                                    </p>
                                )}
                            </button>
                        )}

                        {/* Notes */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Notas de la sesión *</label>
                                {templates.length > 0 && (
                                    <select onChange={e => { if (e.target.value) applyTemplate(e.target.value); e.target.value = '' }}
                                        defaultValue=""
                                        className="text-xs px-2 py-1 border border-border rounded-lg bg-card text-muted-foreground hover:text-foreground cursor-pointer">
                                        <option value="" disabled>⚡ Plantilla</option>
                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                )}
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                required
                                placeholder="Describe el progreso, técnicas aplicadas, reacciones del paciente, observaciones importantes..."
                                className="w-full px-3.5 py-3 border border-border rounded-xl text-sm bg-card text-foreground resize-none focus:outline-none focus:ring-2 transition placeholder:text-muted-foreground/60 leading-relaxed"
                                style={{ minHeight: '120px', '--tw-ring-color': selectedProgress.accent } as any}
                            />
                        </div>

                        {/* Progress rating — always visible */}
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-2">Progreso del paciente *</label>
                            <div className="grid grid-cols-5 gap-1.5">
                                {PROGRESS_OPTIONS.map(opt => (
                                    <button key={opt.value} type="button" onClick={() => setProgressRating(opt.value)}
                                        className="flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all duration-200"
                                        style={progressRating === opt.value
                                            ? { background: opt.bg, borderColor: opt.border, transform: 'scale(1.05)', boxShadow: `0 4px 12px ${opt.accent}30` }
                                            : { borderColor: 'var(--border)', background: 'transparent' }
                                        }>
                                        <span className="text-xl leading-none">{opt.emoji}</span>
                                        <span className="text-[10px] font-medium leading-tight text-muted-foreground">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Metrics — collapsible */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <button type="button" onClick={() => setShowMetrics(!showMetrics)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition text-sm font-medium text-muted-foreground hover:text-foreground">
                                <span className="flex items-center gap-2">
                                    <span className="text-base">📊</span> Escalas clínicas
                                    {(pain !== null || mobility !== null || strength !== null) && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    )}
                                </span>
                                <span className="text-muted-foreground/50">{showMetrics ? '▲' : '▼'}</span>
                            </button>
                            {showMetrics && (
                                <div className="px-4 pb-4 pt-1 grid grid-cols-3 gap-3 border-t border-border">
                                    {[
                                        { label: 'Dolor (EVA)', val: pain, set: setPain, color: '#ef4444', bg: '#fef2f2' },
                                        { label: 'Movilidad', val: mobility, set: setMobility, color: '#3b82f6', bg: '#eff6ff' },
                                        { label: 'Fuerza', val: strength, set: setStrength, color: '#22c55e', bg: '#f0fdf4' },
                                    ].map(m => (
                                        <div key={m.label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-muted/30">
                                            <span className="text-[11px] font-semibold" style={{ color: m.color }}>{m.label}</span>
                                            <input type="range" min="0" max="10" value={m.val ?? 5}
                                                onChange={e => m.set(parseInt(e.target.value))}
                                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                                style={{ accentColor: m.color }}
                                            />
                                            <div className="flex items-center gap-1">
                                                <span className="text-base font-bold" style={{ color: m.val !== null ? m.color : 'var(--muted-foreground)' }}>
                                                    {m.val !== null ? m.val : '–'}
                                                </span>
                                                {m.val !== null && <button type="button" onClick={() => m.set(null)} className="text-[10px] text-muted-foreground hover:text-red-500 transition">✕</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Exercises — collapsible */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <button type="button" onClick={() => setShowExercises(!showExercises)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition text-sm font-medium text-muted-foreground hover:text-foreground">
                                <span className="flex items-center gap-2">
                                    <span className="text-base">🏋️</span> Ejercicios en casa
                                    {selectedExercises.length > 0 && (
                                        <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: selectedProgress.accent }}>
                                            {selectedExercises.length}
                                        </span>
                                    )}
                                </span>
                                <span className="text-muted-foreground/50">{showExercises ? '▲' : '▼'}</span>
                            </button>
                            {showExercises && (
                                <div className="border-t border-border">
                                    {/* Selected tags */}
                                    {selectedExercises.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 px-4 pt-3">
                                            {selectedExercises.map(sel => {
                                                const ex = exercises.find(e => e.id === sel.exercise_id)
                                                if (!ex) return null
                                                return (
                                                    <div key={sel.exercise_id} className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium text-white gap-2"
                                                        style={{ background: selectedProgress.accent }}>
                                                        <span>{ex.name}</span>
                                                        <select value={sel.frequency}
                                                            onChange={e => setSelectedExercises(selectedExercises.map(s => s.exercise_id === sel.exercise_id ? { ...s, frequency: e.target.value } : s))}
                                                            className="bg-white/20 rounded text-[10px] px-1 cursor-pointer border-none outline-none text-white"
                                                            onClick={e => e.stopPropagation()}>
                                                            {FREQUENCIES.map(f => <option key={f.value} value={f.value} className="text-foreground bg-card">{f.label}</option>)}
                                                        </select>
                                                        <button type="button" onClick={() => toggleExercise(sel.exercise_id)} className="w-4 h-4 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center text-[10px] transition">✕</button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                    {/* Search */}
                                    <div className="px-4 pt-2">
                                        <input
                                            type="text"
                                            placeholder="🔍 Buscar ejercicio..."
                                            value={exerciseSearch}
                                            onChange={e => setExerciseSearch(e.target.value)}
                                            className="w-full px-3 py-1.5 text-xs border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-1 mb-2"
                                        />
                                    </div>
                                    <div className="max-h-40 overflow-y-auto px-4 pb-3 space-y-1">
                                        {filteredExercises.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-3">No se encontraron ejercicios</p>
                                        ) : filteredExercises.map(ex => {
                                            const isSel = selectedExercises.some(e => e.exercise_id === ex.id)
                                            return (
                                                <button key={ex.id} type="button" onClick={() => toggleExercise(ex.id)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition text-left"
                                                    style={isSel ? { background: `${selectedProgress.accent}15`, color: selectedProgress.accent } : {}}>
                                                    <div className="w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition"
                                                        style={isSel ? { background: selectedProgress.accent, borderColor: selectedProgress.accent } : { borderColor: 'var(--border)' }}>
                                                        {isSel && <span className="text-white text-[10px]">✓</span>}
                                                    </div>
                                                    <span className="font-medium flex-1">{ex.name}</span>
                                                    <span className="text-xs text-muted-foreground">{ex.category}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fixed bottom action bar */}
                    <div className="flex-shrink-0 px-5 py-4 border-t border-border flex items-center justify-between gap-3 bg-card">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 px-5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                            style={{ background: `linear-gradient(135deg, ${selectedProgress.accent}, ${selectedProgress.accent}cc)`, boxShadow: `0 4px 15px ${selectedProgress.accent}40` }}>
                            <Zap className="w-4 h-4" />
                            {loading ? 'Guardando...' : 'Guardar sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

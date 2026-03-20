'use client'

import { useEffect, useState } from 'react'
import { getNoteTemplates, createNoteTemplate, updateNoteTemplate, deleteNoteTemplate, NoteTemplate } from '@/lib/actions/note-templates'
import { FileText, Plus, Edit, Trash2, Copy, X } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = [
    { value: 'diagnosis', label: '🔍 Diagnóstico', color: 'blue' },
    { value: 'treatment', label: '💊 Tratamiento', color: 'green' },
    { value: 'progress', label: '📈 Evolución', color: 'purple' },
    { value: 'general', label: '📝 General', color: 'gray' }
]

const AVAILABLE_VARIABLES = [
    { name: 'patient_name', label: 'Nombre del paciente' },
    { name: 'patient_age', label: 'Edad del paciente' },
    { name: 'date', label: 'Fecha de sesión' },
    { name: 'service', label: 'Tratamiento' },
    { name: 'therapist_name', label: 'Nombre del fisioterapeuta' },
    { name: 'session_number', label: 'Número de sesión' }
]

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<NoteTemplate[]>([])
    const [filteredCategory, setFilteredCategory] = useState<string>('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'general',
        content: '',
        is_shared: true
    })

    useEffect(() => {
        loadTemplates()
    }, [refreshKey, filteredCategory])

    async function loadTemplates() {
        setLoading(true)
        const data = await getNoteTemplates(filteredCategory || undefined)
        setTemplates(data as NoteTemplate[])
        setLoading(false)
    }

    function openCreateModal() {
        setEditingTemplate(null)
        setFormData({
            name: '',
            category: 'general',
            content: '',
            is_shared: true
        })
        setIsModalOpen(true)
    }

    function openEditModal(template: NoteTemplate) {
        setEditingTemplate(template)
        setFormData({
            name: template.name,
            category: template.category,
            content: template.content,
            is_shared: template.is_shared
        })
        setIsModalOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        try {
            if (editingTemplate) {
                await updateNoteTemplate(editingTemplate.id, formData)
            } else {
                await createNoteTemplate(formData)
            }
            setIsModalOpen(false)
            setRefreshKey(prev => prev + 1)
        } catch (error: any) {
            toast.error(error.message || 'Error inesperado')
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return

        try {
            await deleteNoteTemplate(id)
            setRefreshKey(prev => prev + 1)
        } catch (error: any) {
            toast.error(error.message || 'Error inesperado')
        }
    }

    function insertVariable(varName: string) {
        const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = formData.content
        const before = text.substring(0, start)
        const after = text.substring(end)
        const newText = before + `{${varName}}` + after

        setFormData({ ...formData, content: newText })

        // Set cursor position after inserted variable
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + varName.length + 2, start + varName.length + 2)
        }, 0)
    }

    const getCategoryColor = (category: string) => {
        const cat = CATEGORIES.find(c => c.value === category)
        return cat?.color || 'gray'
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Plantillas de Notas</h1>
                    <p className="text-muted-foreground mt-2">Crea plantillas reutilizables para documentar más rápido</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Plantilla
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilteredCategory('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filteredCategory === ''
                            ? 'bg-blue-600 text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                >
                    Todas
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => setFilteredCategory(cat.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filteredCategory === cat.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">Cargando...</div>
                ) : templates.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No hay plantillas. Crea tu primera plantilla.
                    </div>
                ) : (
                    templates.map(template => (
                        <div key={template.id} className="bg-card border border-border rounded-xl p-4 space-y-3 hover:shadow-md transition">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full bg-${getCategoryColor(template.category)}-100 text-${getCategoryColor(template.category)}-700`}>
                                        {CATEGORIES.find(c => c.value === template.category)?.label}
                                    </span>
                                </div>
                                <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>

                            {template.variables_used && template.variables_used.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {template.variables_used.map(v => (
                                        <span key={v} className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                                            {`{${v}}`}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-2 border-t">
                                <button
                                    onClick={() => openEditModal(template)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4 sm:p-6">
                    <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border flex flex-col">
                        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur z-10">
                            <h2 className="text-2xl font-bold text-foreground">
                                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">
                                        Nombre de la Plantilla
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Categoría
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">
                                    Contenido de la Plantilla
                                </label>
                                <textarea
                                    id="content-textarea"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={15}
                                    className="w-full px-3 py-2 border border-border rounded-lg font-mono text-sm bg-card text-foreground"
                                    placeholder="Escribe tu plantilla aquí. Usa {variable} para insertar variables dinámicas."
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground">
                                    Variables Disponibles (click para insertar)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_VARIABLES.map(v => (
                                        <button
                                            key={v.name}
                                            type="button"
                                            onClick={() => insertVariable(v.name)}
                                            className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition"
                                        >
                                            {`{${v.name}}`} - {v.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_shared}
                                        onChange={(e) => setFormData({ ...formData, is_shared: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-foreground">Compartir con el equipo de la clínica</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-border mt-auto">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm"
                                >
                                    {editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 bg-muted text-muted-foreground font-medium rounded-xl hover:bg-muted/80 hover:text-foreground transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

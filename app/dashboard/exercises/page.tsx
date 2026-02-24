'use client'

import { useEffect, useState } from 'react'
import { getExercises, createExercise, updateExercise, deleteExercise, Exercise } from '@/lib/actions/exercises'
import { Dumbbell, Plus, Edit, Trash2, X, Search } from 'lucide-react'

const CATEGORIES = [
    { value: 'mobility', label: '🏃 Movilidad', color: 'blue' },
    { value: 'strength', label: '💪 Fuerza', color: 'red' },
    { value: 'stretching', label: '🧘 Estiramiento', color: 'green' },
    { value: 'balance', label: '⚖️ Equilibrio', color: 'purple' },
    { value: 'breathing', label: '🫁 Respiración', color: 'cyan' },
    { value: 'functional', label: '🔄 Funcional', color: 'orange' }
]

const DIFFICULTIES = [
    { value: 'beginner', label: 'Principiante', color: 'green' },
    { value: 'intermediate', label: 'Intermedio', color: 'yellow' },
    { value: 'advanced', label: 'Avanzado', color: 'red' }
]

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [filteredCategory, setFilteredCategory] = useState<string>('')
    const [filteredDifficulty, setFilteredDifficulty] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'mobility',
        difficulty: 'beginner',
        duration_minutes: 0,
        repetitions: '',
        sets: 0,
        image_url: '',
        video_url: '',
        is_shared: true
    })

    useEffect(() => {
        loadExercises()
    }, [refreshKey, filteredCategory, filteredDifficulty, searchQuery])

    async function loadExercises() {
        setLoading(true)
        const data = await getExercises({
            category: filteredCategory || undefined,
            difficulty: filteredDifficulty || undefined,
            search: searchQuery || undefined
        })
        setExercises(data as Exercise[])
        setLoading(false)
    }

    function openCreateModal() {
        setEditingExercise(null)
        setFormData({
            name: '',
            description: '',
            category: 'mobility',
            difficulty: 'beginner',
            duration_minutes: 0,
            repetitions: '',
            sets: 0,
            image_url: '',
            video_url: '',
            is_shared: true
        })
        setIsModalOpen(true)
    }

    function openEditModal(exercise: Exercise) {
        setEditingExercise(exercise)
        setFormData({
            name: exercise.name,
            description: exercise.description,
            category: exercise.category,
            difficulty: exercise.difficulty,
            duration_minutes: exercise.duration_minutes || 0,
            repetitions: exercise.repetitions || '',
            sets: exercise.sets || 0,
            image_url: exercise.image_url || '',
            video_url: exercise.video_url || '',
            is_shared: exercise.is_shared
        })
        setIsModalOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        try {
            const submitData = {
                ...formData,
                duration_minutes: formData.duration_minutes || undefined,
                repetitions: formData.repetitions || undefined,
                sets: formData.sets || undefined,
                image_url: formData.image_url || undefined,
                video_url: formData.video_url || undefined
            }

            if (editingExercise) {
                await updateExercise(editingExercise.id, submitData)
            } else {
                await createExercise(submitData)
            }
            setIsModalOpen(false)
            setRefreshKey(prev => prev + 1)
        } catch (error: any) {
            alert('Error: ' + error.message)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar este ejercicio?')) return

        try {
            await deleteExercise(id)
            setRefreshKey(prev => prev + 1)
        } catch (error: any) {
            alert('Error: ' + error.message)
        }
    }

    const getCategoryInfo = (category: string) => CATEGORIES.find(c => c.value === category)
    const getDifficultyInfo = (difficulty: string) => DIFFICULTIES.find(d => d.value === difficulty)

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Biblioteca de Ejercicios</h1>
                    <p className="text-slate-600 mt-2">Gestiona ejercicios para asignar a tus pacientes</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Ejercicio
                </button>
            </div>

            {/* Filters */}
            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar ejercicios..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilteredCategory('')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filteredCategory === ''
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Dificultad</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilteredDifficulty('')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filteredDifficulty === ''
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Todas
                        </button>
                        {DIFFICULTIES.map(diff => (
                            <button
                                key={diff.value}
                                onClick={() => setFilteredDifficulty(diff.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filteredDifficulty === diff.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {diff.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Exercises Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-slate-500">Cargando...</div>
                ) : exercises.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No hay ejercicios. Crea tu primer ejercicio.
                    </div>
                ) : (
                    exercises.map(exercise => {
                        const catInfo = getCategoryInfo(exercise.category)
                        const diffInfo = getDifficultyInfo(exercise.difficulty)

                        return (
                            <div key={exercise.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition">
                                {exercise.image_url && (
                                    <div className="h-40 bg-slate-100 overflow-hidden">
                                        <img
                                            src={exercise.image_url}
                                            alt={exercise.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{exercise.name}</h3>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                {catInfo?.label}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full bg-${diffInfo?.color}-100 text-${diffInfo?.color}-700`}>
                                                {diffInfo?.label}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-600 line-clamp-3">{exercise.description}</p>

                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        {exercise.duration_minutes && (
                                            <span>⏱️ {exercise.duration_minutes} min</span>
                                        )}
                                        {exercise.repetitions && (
                                            <span>🔄 {exercise.repetitions}</span>
                                        )}
                                        {exercise.sets && (
                                            <span>📊 {exercise.sets} series</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t">
                                        <button
                                            onClick={() => openEditModal(exercise)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exercise.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold">
                                {editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nombre del Ejercicio
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Categoría
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Dificultad
                                    </label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        {DIFFICULTIES.map(diff => (
                                            <option key={diff.value} value={diff.value}>{diff.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Descripción e Instrucciones
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={8}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Describe paso a paso cómo realizar el ejercicio..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Duración (min)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration_minutes}
                                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Repeticiones
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.repetitions}
                                        onChange={(e) => setFormData({ ...formData, repetitions: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="10-15"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Series
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.sets}
                                        onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    URL de Imagen
                                </label>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    URL de Video (opcional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.video_url}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_shared}
                                        onChange={(e) => setFormData({ ...formData, is_shared: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-slate-700">Compartir con el equipo de la clínica</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingExercise ? 'Actualizar Ejercicio' : 'Crear Ejercicio'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-slate-50"
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

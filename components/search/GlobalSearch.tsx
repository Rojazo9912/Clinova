'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Users, Calendar, DollarSign, FileText, Loader2 } from 'lucide-react'
import { searchGlobal } from '@/lib/actions/search'

interface SearchResult {
    type: 'patient' | 'appointment' | 'payment' | 'session'
    id: string
    title: string
    subtitle: string
    href: string
}

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const router = useRouter()

    // Keyboard shortcut (Cmd+K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(true)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Search function with debounce
    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([])
            return
        }

        setLoading(true)
        try {
            const data = await searchGlobal(searchQuery)
            setResults(data)
        } catch (error) {
            console.error('Search error:', error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query)
        }, 300)

        return () => clearTimeout(timer)
    }, [query, performSearch])

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((prev) => Math.max(prev - 1, 0))
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault()
                handleSelectResult(results[selectedIndex])
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, results, selectedIndex])

    const handleSelectResult = (result: SearchResult) => {
        router.push(result.href)
        setIsOpen(false)
        setQuery('')
        setResults([])
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'patient':
                return <Users className="h-4 w-4" />
            case 'appointment':
                return <Calendar className="h-4 w-4" />
            case 'payment':
                return <DollarSign className="h-4 w-4" />
            case 'session':
                return <FileText className="h-4 w-4" />
            default:
                return <Search className="h-4 w-4" />
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'patient':
                return 'Paciente'
            case 'appointment':
                return 'Cita'
            case 'payment':
                return 'Pago'
            case 'session':
                return 'Sesión'
            default:
                return type
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-in zoom-in-95 slide-in-from-top-10">
                <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 p-4 border-b">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar pacientes, citas, pagos..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-lg"
                            autoFocus
                        />
                        {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-muted rounded-md transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto">
                        {query.length < 2 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">Escribe al menos 2 caracteres para buscar</p>
                                <p className="text-xs mt-2">
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd</kbd> +
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs ml-1">K</kbd> para abrir
                                </p>
                            </div>
                        ) : results.length === 0 && !loading ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <p className="text-sm">No se encontraron resultados</p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {results.map((result, index) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelectResult(result)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${index === selectedIndex
                                                ? 'bg-primary/10 border border-primary/20'
                                                : 'hover:bg-muted'
                                            }`}
                                    >
                                        <div className="p-2 bg-muted rounded-md">
                                            {getIcon(result.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{result.title}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {result.subtitle}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                                            {getTypeLabel(result.type)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-background rounded">↑</kbd>
                                <kbd className="px-1.5 py-0.5 bg-background rounded">↓</kbd>
                                navegar
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-background rounded">Enter</kbd>
                                seleccionar
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-background rounded">Esc</kbd>
                                cerrar
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

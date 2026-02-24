'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-red-50 p-4">
                <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">¡Algo salió mal!</h2>
            <p className="max-w-md text-center text-slate-500">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
            </p>
            <div className="mt-4 flex gap-4">
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                    Ir al Inicio
                </button>
                <button
                    onClick={() => reset()}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Intentar de nuevo
                </button>
            </div>
        </div>
    )
}

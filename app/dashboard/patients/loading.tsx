export default function PatientsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-36 bg-slate-200 rounded-md" />
                    <div className="h-4 w-48 bg-slate-100 rounded" />
                </div>
                <div className="h-10 w-32 bg-slate-200 rounded-xl" />
            </div>

            {/* Search bar */}
            <div className="h-11 w-full bg-slate-100 rounded-xl" />

            {/* Patient list */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-4 w-40 bg-slate-200 rounded" />
                                <div className="h-3 w-28 bg-slate-100 rounded" />
                            </div>
                            <div className="h-3 w-20 bg-slate-100 rounded hidden sm:block" />
                            <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

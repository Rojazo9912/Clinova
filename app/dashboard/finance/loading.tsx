export default function FinanceLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-28 bg-slate-200 rounded-md" />
                    <div className="h-4 w-44 bg-slate-100 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-28 bg-slate-200 rounded-xl" />
                    <div className="h-10 w-28 bg-slate-200 rounded-xl" />
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl border bg-white shadow-sm p-6 space-y-3">
                        <div className="h-4 w-28 bg-slate-200 rounded" />
                        <div className="h-8 w-24 bg-slate-200 rounded" />
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                    </div>
                ))}
            </div>

            {/* Payments table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <div className="h-5 w-32 bg-slate-200 rounded" />
                </div>
                <div className="divide-y divide-slate-50">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4">
                            <div className="flex-1 space-y-1.5">
                                <div className="h-4 w-40 bg-slate-200 rounded" />
                                <div className="h-3 w-24 bg-slate-100 rounded" />
                            </div>
                            <div className="h-4 w-20 bg-slate-200 rounded" />
                            <div className="h-6 w-16 bg-slate-100 rounded-full" />
                            <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

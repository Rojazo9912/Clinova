export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Greeting skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded-md" />
                    <div className="h-9 w-64 bg-slate-200 rounded-md" />
                </div>
                <div className="h-10 w-32 bg-slate-200 rounded-xl" />
            </div>

            {/* Metrics skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 space-y-3">
                        <div className="flex justify-between">
                            <div className="h-4 w-28 bg-slate-200 rounded" />
                            <div className="h-4 w-4 bg-slate-200 rounded" />
                        </div>
                        <div className="h-8 w-20 bg-slate-200 rounded" />
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                    </div>
                ))}
            </div>

            {/* Appointment timeline skeleton */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-slate-200 rounded" />
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                    </div>
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
                <div className="divide-y divide-slate-50">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4">
                            <div className="w-12 space-y-1">
                                <div className="h-4 w-10 bg-slate-200 rounded mx-auto" />
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-slate-200 flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-4 w-36 bg-slate-200 rounded" />
                                <div className="h-3 w-24 bg-slate-100 rounded" />
                            </div>
                            <div className="h-6 w-20 bg-slate-100 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Revenue chart skeleton */}
            <div className="rounded-xl border bg-white shadow-sm p-6 space-y-4">
                <div className="h-5 w-36 bg-slate-200 rounded" />
                <div className="h-48 w-full bg-slate-100 rounded-lg" />
            </div>
        </div>
    )
}

export default function AgendaLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="h-9 w-20 bg-slate-200 rounded-lg" />
                    <div className="h-9 w-20 bg-slate-200 rounded-lg" />
                    <div className="h-9 w-20 bg-slate-200 rounded-lg" />
                </div>
                <div className="h-9 w-36 bg-slate-200 rounded-lg" />
                <div className="h-9 w-28 bg-slate-200 rounded-lg" />
            </div>

            {/* Calendar grid */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-slate-100">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="p-3 text-center">
                            <div className="h-3 w-8 bg-slate-200 rounded mx-auto" />
                        </div>
                    ))}
                </div>
                {/* Time slots */}
                <div className="h-[600px] flex">
                    <div className="w-16 flex-shrink-0 border-r border-slate-100 p-2 space-y-8 pt-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-3 w-10 bg-slate-100 rounded" />
                        ))}
                    </div>
                    <div className="flex-1 bg-slate-50/50">
                        {/* Some appointment placeholders */}
                        <div className="p-4 space-y-2">
                            <div className="h-12 w-3/4 bg-blue-100 rounded-lg" />
                            <div className="h-16 w-1/2 bg-emerald-100 rounded-lg ml-20 mt-8" />
                            <div className="h-10 w-2/3 bg-violet-100 rounded-lg mt-16" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

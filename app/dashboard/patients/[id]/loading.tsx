export default function PatientDetailLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Patient header card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                        <div className="h-9 w-56 bg-slate-200 rounded-md" />
                        <div className="flex gap-4">
                            <div className="h-4 w-40 bg-slate-100 rounded" />
                            <div className="h-4 w-28 bg-slate-100 rounded" />
                        </div>
                        {/* Clinical snapshot pills */}
                        <div className="flex gap-2 mt-4">
                            <div className="h-9 w-28 bg-emerald-100 rounded-xl" />
                            <div className="h-9 w-32 bg-slate-100 rounded-xl" />
                            <div className="h-9 w-24 bg-slate-100 rounded-xl" />
                            <div className="h-9 w-36 bg-slate-100 rounded-xl" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                        <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Treatment plan */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <div className="h-5 w-40 bg-slate-200 rounded" />
                        <div className="h-4 w-full bg-slate-100 rounded" />
                        <div className="h-4 w-3/4 bg-slate-100 rounded" />
                    </div>

                    {/* Clinical history */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <div className="h-5 w-36 bg-slate-200 rounded" />
                        </div>
                        <div className="p-6 space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2 border-b border-slate-50 pb-4">
                                    <div className="h-4 w-48 bg-slate-200 rounded" />
                                    <div className="h-3 w-full bg-slate-100 rounded" />
                                    <div className="h-3 w-5/6 bg-slate-100 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* New consultation form */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-blue-50">
                            <div className="h-5 w-32 bg-blue-100 rounded" />
                        </div>
                        <div className="p-6 space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="h-3 w-20 bg-slate-200 rounded" />
                                    <div className="h-9 w-full bg-slate-100 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <div className="h-5 w-36 bg-slate-200 rounded" />
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-24 bg-slate-200 rounded" />
                                    <div className="h-3 w-32 bg-slate-100 rounded" />
                                </div>
                                <div className="h-6 w-16 bg-slate-200 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

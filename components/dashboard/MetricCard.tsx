'use client'

interface MetricCardProps {
    title: string
    value: string | number
    change?: number
    trend?: 'up' | 'down'
    subtitle?: string
    emoji: string
    friendlyText?: string
    bgFrom: string
    bgTo: string
}

export default function MetricCard({
    title,
    value,
    change,
    trend,
    subtitle,
    emoji,
    friendlyText,
    bgFrom,
    bgTo,
}: MetricCardProps) {
    const isPositive = trend === 'up' || (change !== undefined && change > 0)
    const isNegative = trend === 'down' || (change !== undefined && change < 0)

    return (
        <div className={`rounded-2xl p-5 bg-gradient-to-br ${bgFrom} ${bgTo} shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden`}>
            {/* Emoji decoration */}
            <div className="absolute top-3 right-4 text-3xl opacity-80 select-none">
                {emoji}
            </div>

            {/* Friendly subtitle above title */}
            {friendlyText && (
                <p className="text-xs font-medium text-slate-500 mb-0.5">{friendlyText}</p>
            )}

            <p className="text-sm font-semibold text-slate-700 pr-10">{title}</p>

            {/* Value */}
            <p className="text-3xl font-extrabold text-slate-900 mt-2 leading-none">{value}</p>

            {/* Change + subtitle */}
            <div className="flex items-center gap-2 mt-2 text-xs">
                {change !== undefined && (
                    <span className={`flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-full ${
                        isPositive ? 'bg-green-100 text-green-700' :
                        isNegative ? 'bg-red-100 text-red-600' :
                        'bg-slate-100 text-slate-500'
                    }`}>
                        {isPositive ? '▲' : isNegative ? '▼' : '●'} {Math.abs(change)}%
                    </span>
                )}
                {subtitle && (
                    <span className="text-slate-500">{subtitle}</span>
                )}
            </div>
        </div>
    )
}

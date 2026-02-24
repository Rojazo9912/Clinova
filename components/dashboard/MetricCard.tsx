'use client'

import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'

interface MetricCardProps {
    title: string
    value: string | number
    change?: number
    icon: LucideIcon
    trend?: 'up' | 'down'
    subtitle?: string
}

export default function MetricCard({ title, value, change, icon: Icon, trend, subtitle }: MetricCardProps) {
    const isPositive = trend === 'up' || (change && change > 0)

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="space-y-1">
                    <p className="text-2xl font-bold">{value}</p>

                    {(change !== undefined || subtitle) && (
                        <div className="flex items-center gap-2 text-xs">
                            {change !== undefined && (
                                <span className={`flex items-center gap-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {isPositive ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(change)}%
                                </span>
                            )}
                            {subtitle && (
                                <span className="text-muted-foreground">{subtitle}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

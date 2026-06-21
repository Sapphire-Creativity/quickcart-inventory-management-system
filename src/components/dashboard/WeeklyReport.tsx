'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMoreVertical } from 'react-icons/fi'
import { WeeklyAreaChart } from '@/components/charts'
import type { WeeklyRevenueData } from '@/actions/dashboard'

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-neutral-100 rounded-xl ${className}`} />
)

function formatK(n: number): string {
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
    if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K'
    return '$' + n.toFixed(0)
}

export function WeeklyReport({
    data,
    loading,
}: {
    data: WeeklyRevenueData | null
    loading: boolean
}) {
    const [activeWeek, setActiveWeek] = useState<'this' | 'last'>('this')

    const chartData = activeWeek === 'this'
        ? (data?.thisWeek ?? [])
        : (data?.lastWeek ?? [])

    // Derive metrics from real data
    const thisWeekTotal = data?.thisWeekTotal ?? 0
    const lastWeekTotal = data?.lastWeekTotal ?? 0
    const avgOrder = data
        ? thisWeekTotal > 0 && (data.thisWeek.filter(d => d.value > 0).length > 0)
            ? thisWeekTotal / data.thisWeek.filter(d => d.value > 0).length
            : 0
        : 0

    const metrics = [
        { label: 'Revenue', value: formatK(thisWeekTotal) },
        { label: 'Last Week', value: formatK(lastWeekTotal) },
        { label: 'Avg. Day', value: formatK(avgOrder) },
        { label: 'Change', value: data ? `${data.weekOverWeekChange > 0 ? '+' : ''}${data.weekOverWeekChange}%` : '—' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white border border-neutral-200 rounded-2xl p-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">Weekly Report</h3>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-xs p-0.5 gap-0.5 bg-neutral-50">
                        {(['this', 'last'] as const).map(week => (
                            <button
                                key={week}
                                onClick={() => setActiveWeek(week)}
                                className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${activeWeek === week
                                        ? 'bg-white text-brand-600 shadow-sm border border-neutral-200'
                                        : 'text-neutral-500 hover:text-neutral-700'
                                    }`}
                            >
                                {week === 'this' ? 'This week' : 'Last week'}
                            </button>
                        ))}
                    </div>
                    <button className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all duration-200">
                        <FiMoreVertical size={15} />
                    </button>
                </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-4 gap-4 mb-5 pb-5 border-b border-neutral-200">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="w-16 h-6" />
                            <Skeleton className="w-12 h-3" />
                        </div>
                    ))
                ) : (
                    metrics.map((metric, i) => (
                        <div key={metric.label} className="min-w-0">
                            <p className={`text-xl font-bold tracking-tight truncate ${metric.label === 'Change'
                                    ? (data?.weekOverWeekChange ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'
                                    : 'text-neutral-900'
                                }`}>
                                {metric.value}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1 truncate">{metric.label}</p>
                            {i === 0 && (
                                <div className="mt-1.5 h-0.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Chart */}
            {loading ? (
                <Skeleton className="w-full h-48" />
            ) : (
                <WeeklyAreaChart data={chartData} />
            )}
        </motion.div>
    )
}
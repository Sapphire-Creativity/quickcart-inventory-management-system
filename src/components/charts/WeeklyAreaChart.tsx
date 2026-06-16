'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  day: string
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-neutral-200 rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-neutral-900">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  )
}

export function WeeklyAreaChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f0f0f0"
          vertical={false}
        />

        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: '#a3a3a3', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />

        <YAxis
          tick={{ fontSize: 11, fill: '#a3a3a3' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v >= 1000 ? `$${v / 1000}k` : `$${v}`}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />

        <Area
          type="monotone"
          dataKey="value"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#weeklyGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
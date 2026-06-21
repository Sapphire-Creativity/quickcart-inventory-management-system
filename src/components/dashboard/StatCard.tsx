"use client";

import { FiTrendingUp, FiTrendingDown, FiInfo } from "react-icons/fi";

export function StatCard({
  title,
  subtitle,
  value,
  valuePrefix,
  valueSuffix,
  change,
  changeLabel,
  icon: Icon,
  variant = "default",
  onDetails
}: {
  title: string
  subtitle: string
  value: string | number
  valuePrefix?: string
  valueSuffix?: string
  change?: number
  changeLabel?: string
  icon: React.ElementType
  variant?: "default" | "success" | "warning" | "danger" | "info"
  onDetails?: () => void
}) {
  const variants = {
    default: "from-white to-neutral-50/50 border-neutral-200/60",
    success: "from-emerald-50/30 to-emerald-50/10 border-emerald-200/60",
    warning: "from-amber-50/30 to-amber-50/10 border-amber-200/60",
    danger: "from-red-50/30 to-red-50/10 border-red-200/60",
    info: "from-blue-50/30 to-blue-50/10 border-blue-200/60",
  };

  const iconVariants = {
    default: "bg-neutral-100 text-neutral-600",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    danger: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-600",
  };

  const isPositive = (change ?? 0) > 0;

  return (
    <div className={`card relative group bg-gradient-to-br ${variants[variant]} border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${iconVariants[variant]} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
            <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {onDetails && (
          <button
            onClick={onDetails}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <FiInfo size={14} />
          </button>
        )}
      </div>

      {/* Value */}
      <div className="relative mb-3">
        <div className="flex items-baseline gap-1">
          {valuePrefix && <span className="text-sm text-neutral-400">{valuePrefix}</span>}
          <span className="text-2xl font-bold text-neutral-900 tracking-tight">{value}</span>
          {valueSuffix && <span className="text-sm text-neutral-400">{valueSuffix}</span>}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}>
              {isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
              {isPositive ? '+' : ''}{change}%
            </span>
            {changeLabel && (
              <span className="text-xs text-neutral-400">{changeLabel}</span>
            )}
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {change !== undefined && (
        <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            style={{ width: `${Math.min(Math.abs(change) * 5, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
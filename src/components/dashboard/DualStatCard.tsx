"use client";

import React from "react";
import { FiTrendingUp, FiTrendingDown, FiInfo } from "react-icons/fi";

export function DualStatCard({
    title,
    subtitle,
    stats,
    icon: Icon,
    variant = "warning",
    onDetails
}) {
    const variants = {
        default: "from-white to-neutral-50/50 border-neutral-200/60",
        warning: "from-amber-50/30 to-amber-50/10 border-amber-200/60",
        danger: "from-red-50/30 to-red-50/10 border-red-200/60",
    };

    const iconVariants = {
        default: "bg-neutral-100 text-neutral-600",
        warning: "bg-amber-100 text-amber-600",
        danger: "bg-red-100 text-red-600",
    };

    return (
        <div className={`card relative group bg-gradient-to-br ${variants[variant]} border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
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

            {/* Stats Grid */}
            <div className="relative grid grid-cols-2 gap-3">
                {stats.map((stat, index) => (
                    <div key={index} className="p-3 rounded-xl bg-white/60 border border-neutral-100 hover:bg-white transition-colors duration-200">
                        <p className="text-xs font-medium text-neutral-500 mb-1">{stat.label}</p>
                        <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
                        {stat.change !== undefined && (
                            <div className="flex items-center gap-1 mt-0.5">
                                {stat.change > 0 ? (
                                    <FiTrendingUp size={10} className="text-emerald-500" />
                                ) : (
                                    <FiTrendingDown size={10} className="text-red-500" />
                                )}
                                <span className={`text-xs font-semibold ${stat.change > 0 ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                    {stat.change > 0 ? '+' : ''}{stat.change}%
                                </span>
                            </div>
                        )}
                        {stat.subtext && (
                            <p className="text-xs text-neutral-400 mt-0.5">{stat.subtext}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
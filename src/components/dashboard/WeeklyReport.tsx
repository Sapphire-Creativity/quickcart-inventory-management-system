"use client";

// ─────────────────────────────────────────────────────────────────────────────
// WeeklyReport — Area chart card with this/last week toggle
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMoreVertical } from "react-icons/fi";
import { WeeklyAreaChart } from "@/components/charts";

const THIS_WEEK_DATA = [
    { day: "Mon", value: 2400 },
    { day: "Tue", value: 1398 },
    { day: "Wed", value: 9800 },
    { day: "Thu", value: 3908 },
    { day: "Fri", value: 4800 },
    { day: "Sat", value: 3800 },
    { day: "Sun", value: 4300 },
];

const LAST_WEEK_DATA = [
    { day: "Mon", value: 1800 },
    { day: "Tue", value: 2200 },
    { day: "Wed", value: 7500 },
    { day: "Thu", value: 3200 },
    { day: "Fri", value: 4100 },
    { day: "Sat", value: 3500 },
    { day: "Sun", value: 3900 },
];

const WEEKLY_METRICS = [
    { label: "Revenue", value: "$14.2K", active: true },
    { label: "Orders", value: "486", active: false },
    { label: "Avg. Order", value: "$29.2", active: false },
    { label: "Visitors", value: "2.4K", active: false },
    { label: "Conv. Rate", value: "4.2%", active: false },
];

export function WeeklyReport() {
    const [activeWeek, setActiveWeek] = useState("this");
    const chartData = activeWeek === "this" ? THIS_WEEK_DATA : LAST_WEEK_DATA;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white border border-neutral-200 rounded-2xl p-5"
        >
            {/* ── Card Header ── */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
                    Weekly Report
                </h3>

                <div className="flex items-center gap-2">
                    {/* Week Selector */}
                    <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-xs p-0.5 gap-0.5 bg-neutral-50">
                        {["this", "last"].map((week) => (
                            <button
                                key={week}
                                onClick={() => setActiveWeek(week)}
                                className={`
                  px-3 py-1.5 rounded-md font-medium transition-all duration-200
                  ${activeWeek === week
                                        ? "bg-white text-brand-600 shadow-sm border border-neutral-200"
                                        : "text-neutral-500 hover:text-neutral-700"
                                    }
                `}
                            >
                                {week === "this" ? "This week" : "Last week"}
                            </button>
                        ))}
                    </div>

                    <button className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all duration-200">
                        <FiMoreVertical size={15} />
                    </button>
                </div>
            </div>

            {/* ── Metrics Row ── */}
            <div className="grid grid-cols-5 gap-4 mb-5 pb-5 border-b border-neutral-200">
                {WEEKLY_METRICS.map((metric) => (
                    <div key={metric.label} className="min-w-0">
                        <p className="text-xl font-bold text-neutral-900 tracking-tight truncate">
                            {metric.value}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1 truncate">
                            {metric.label}
                        </p>
                        {metric.active && (
                            <div className="mt-1.5 h-0.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Chart ── */}
        </motion.div>
    );
}
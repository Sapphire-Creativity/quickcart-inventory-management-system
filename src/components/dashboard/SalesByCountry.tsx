"use client";

// ─────────────────────────────────────────────────────────────────────────────
// SalesByCountry — Regional sales breakdown with animated progress bars
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { motion } from "framer-motion";
import { MoreVertical } from "@/components/icons";
import { COUNTRY_SALES } from "@/constants";

export function SalesByCountry() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="card p-4 flex-1 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading">Sales by Country</h3>
        <button className="btn btn-ghost btn-icon text-[var(--color-text-disabled)]">
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Country rows */}
      <div className="space-y-4 flex-1">
        {COUNTRY_SALES.map((c, i) => (
          <div key={c.name} className="flex items-center gap-3">
            {/* Flag */}
            <span className="text-2xl shrink-0 leading-none">{c.flag}</span>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className="text-[var(--color-text-primary)]"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  {c.value}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: c.trendUp ? "var(--color-brand-600)" : "var(--color-danger-500)",
                  }}
                >
                  {c.change}
                </span>
              </div>
              <p className="text-caption mb-1.5">{c.name}</p>

              {/* Progress */}
              <div className="progress">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${c.barPercent}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button className="mt-4 btn btn-secondary btn-pill w-full text-[12px]">
        View Full Insight
      </button>
    </motion.div>
  );
}

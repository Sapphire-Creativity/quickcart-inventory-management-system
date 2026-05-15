"use client";

// ─────────────────────────────────────────────────────────────────────────────
// UsersBarChart — Compact bar chart for users-per-minute widget
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import type { MinuteDataPoint } from "../../../types";

const MiniTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip py-1.5 px-2.5">
      <span className="text-white font-semibold">{payload[0].value}</span>
      <span className="text-[var(--color-slate-400)] ml-1">users</span>
    </div>
  );
};

interface UsersBarChartProps {
  data: MinuteDataPoint[];
  height?: number;
}

export function UsersBarChart({ data, height = 44 }: UsersBarChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={5}>
          <Tooltip
            content={<MiniTooltip />}
            cursor={{ fill: "var(--color-surface-2)" }}
          />
          <Bar dataKey="v" radius={[3, 3, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={
                  index === data.length - 1
                    ? "var(--color-brand-600)"
                    : index % 3 === 0
                      ? "var(--color-brand-400)"
                      : "var(--color-brand-500)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

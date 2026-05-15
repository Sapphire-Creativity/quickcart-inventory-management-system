"use client";

// ─────────────────────────────────────────────────────────────────────────────
// UsersWidget — Real-time users in last 30 minutes card
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { motion } from "framer-motion";
import { MoreVertical } from "@/components/icons";
import { UsersBarChart } from "@/components/charts";
import { USERS_PER_MINUTE } from "@/constants";

export function UsersWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="card p-4"
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-semibold"
          style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-brand-600)" }}
        >
          Users · Last 30 min
        </span>
        <button className="btn btn-ghost btn-icon text-[var(--color-text-disabled)]">
          <MoreVertical size={14} />
        </button>
      </div>

      <p
        className="leading-none mb-0.5"
        style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--color-text-primary)" }}
      >
        21.5K
      </p>
      <p className="text-caption mb-3">active users per minute</p>

      <UsersBarChart data={USERS_PER_MINUTE} />
    </motion.div>
  );
}

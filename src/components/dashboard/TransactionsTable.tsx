"use client";

// ─────────────────────────────────────────────────────────────────────────────
// TransactionsTable — Recent transactions with status badges
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { motion } from "framer-motion";
import { Filter } from "@/components/icons";
import { StatusBadge } from "@/components/ui";
import { TRANSACTIONS } from "@/constants";

export function TransactionsTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="w-full card p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading">Transactions</h3>
        <button className="btn btn-primary btn-sm gap-1.5">
          <Filter size={12} />
          Filter
        </button>
      </div>

      {/* Table */}
      <table className="table" role="table">
        <thead>
          <tr>
            <th style={{ width: 36 }}>#</th>
            <th>Customer ID</th>
            <th>Order Date</th>
            <th>Status</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {TRANSACTIONS.map((tx, i) => (
            <motion.tr
              key={tx.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.25 }}
            >
              <td className="text-[var(--color-text-muted)] text-[13px]">
                {tx.id}.
              </td>
              <td>
                <span
                  className="text-[var(--color-text-primary)]"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  {tx.customerId}
                </span>
              </td>
              <td className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>
                {tx.orderDate}
              </td>
              <td>
                <StatusBadge status={tx.status} />
              </td>
              <td className="text-right">
                <span
                  className="text-[var(--color-text-primary)]"
                  style={{ fontSize: 13, fontWeight: 700 }}
                >
                  {tx.amount}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

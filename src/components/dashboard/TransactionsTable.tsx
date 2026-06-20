'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-neutral-100 rounded ${className}`} />
)

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
}

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  sale: { label: 'Sale', className: 'bg-emerald-100 text-emerald-700' },
  refund: { label: 'Refund', className: 'bg-red-100 text-red-700' },
}

export function TransactionsTable({
  transactions,
  loading,
}: {
  transactions: any[]
  loading: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="w-full card p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading">Recent Transactions</h3>
        <Link
          href="/dashboard/transactions"
          className="text-xs font-medium text-brand-600 hover:underline"
        >
          View all →
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wide pb-3 pr-4">#</th>
              <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wide pb-3 pr-4">Order</th>
              <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wide pb-3 pr-4">Customer</th>
              <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wide pb-3 pr-4">Date</th>
              <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wide pb-3 pr-4">Type</th>
              <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wide pb-3 pr-4">Status</th>
              <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wide pb-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-neutral-50">
                  <td className="py-3 pr-4"><Skeleton className="w-4 h-3" /></td>
                  <td className="py-3 pr-4"><Skeleton className="w-24 h-3" /></td>
                  <td className="py-3 pr-4"><Skeleton className="w-28 h-3" /></td>
                  <td className="py-3 pr-4"><Skeleton className="w-20 h-3" /></td>
                  <td className="py-3 pr-4"><Skeleton className="w-12 h-5 rounded-full" /></td>
                  <td className="py-3 pr-4"><Skeleton className="w-16 h-5 rounded-full" /></td>
                  <td className="py-3 text-right"><Skeleton className="w-16 h-3 ml-auto" /></td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-neutral-400">
                  No transactions yet. Complete an order to see transactions here.
                </td>
              </tr>
            ) : (
              transactions.map((tx, i) => {
                const order = tx.orders as any
                const customer = order?.customers as any
                const statusCfg = STATUS_CONFIG[tx.status] ?? { label: tx.status, className: 'bg-gray-100 text-gray-600' }
                const typeCfg = TYPE_CONFIG[tx.type] ?? { label: tx.type, className: 'bg-gray-100 text-gray-600' }
                const isRefund = tx.type === 'refund'

                return (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.25 }}
                    className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="py-3 pr-4 text-neutral-300 text-xs">{i + 1}.</td>
                    <td className="py-3 pr-4">
                      <span className="font-mono text-[13px] font-semibold text-neutral-800">
                        {order?.order_number ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[13px] font-medium text-neutral-700">
                        {customer?.name ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-neutral-400 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeCfg.className}`}>
                        {typeCfg.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-[13px] font-bold ${isRefund ? 'text-red-600' : 'text-neutral-900'}`}>
                        {isRefund ? '−' : ''}${Number(tx.amount).toFixed(2)}
                      </span>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
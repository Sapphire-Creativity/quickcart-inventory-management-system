'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiDollarSign, FiShoppingBag, FiClock } from 'react-icons/fi'
import { StatCard } from '@/components/dashboard/StatCard'
import { DualStatCard } from '@/components/dashboard/DualStatCard'
import { WeeklyReport } from '@/components/dashboard/WeeklyReport'
import { UsersWidget } from '@/components/dashboard/UsersWidget'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { TransactionsTable } from '@/components/dashboard/TransactionsTable'

import {
  getDashboardStats,
  getWeeklyRevenue,
  getTopProducts,
  getRecentTransactions,
  type DashboardStats,
  type WeeklyRevenueData,
  type TopProduct,
} from '@/actions/dashboard'

// ── Animation variants ─────────────────────────────────────

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ── Skeleton loader ────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-neutral-100 rounded-xl ${className}`} />
)

const StatCardSkeleton = () => (
  <div className="border border-neutral-200 rounded-2xl p-5 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-1.5">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-16 h-2.5" />
      </div>
    </div>
    <Skeleton className="w-32 h-8" />
    <Skeleton className="w-full h-1" />
  </div>
)

// ── Helper ─────────────────────────────────────────────────

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M'
  if (amount >= 1_000) return (amount / 1_000).toFixed(1) + 'K'
  return amount.toFixed(0)
}

// ── Page ───────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyRevenueData | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[] | null>(null)
  const [recentTx, setRecentTx] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [statsRes, weeklyRes, productsRes, txRes] = await Promise.all([
        getDashboardStats(),
        getWeeklyRevenue(),
        getTopProducts(5),
        getRecentTransactions(),
      ])

      if (statsRes.error) { setError(statsRes.error); setLoading(false); return }

      setStats(statsRes.data)
      setWeeklyData(weeklyRes.data)
      setTopProducts(productsRes.data)
      setRecentTx(txRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        Failed to load dashboard: {error}
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5 max-w-[1400px]"
    >
      {/* ── Row 1: KPI Stat Cards ── */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            {/* Total Revenue */}
            <StatCard
              title="Total Revenue"
              subtitle="Last 7 days"
              value={formatRevenue(stats?.revenue.thisWeek ?? 0)}
              valuePrefix="$"
              change={stats?.revenue.weekOverWeekChange}
              changeLabel={`vs. previous 7 days ($${formatRevenue(stats?.revenue.lastWeek ?? 0)})`}
              icon={FiDollarSign}
              variant="success"
            />

            {/* Total Orders */}
            <StatCard
              title="Total Orders"
              subtitle="Last 7 days"
              value={stats?.orders.thisWeek.toLocaleString() ?? '0'}
              change={stats?.orders.weekOverWeekChange}
              changeLabel={`vs. previous 7 days (${stats?.orders.lastWeek ?? 0})`}
              icon={FiShoppingBag}
              variant="success"
            />

            {/* Pending & Cancelled */}
            <DualStatCard
              title="Pending & Cancelled"
              subtitle="All time"
              icon={FiClock}
              variant="warning"
              stats={[
                {
                  label: 'Pending',
                  value: stats?.orders.pending.toLocaleString() ?? '0',
                  subtext: `${stats?.orders.processing ?? 0} processing`,
                },
                {
                  label: 'Cancelled',
                  value: stats?.orders.cancelled.toLocaleString() ?? '0',
                  subtext: `${stats?.orders.completed ?? 0} completed`,
                },
              ]}
            />
          </>
        )}
      </motion.div>

      {/* ── Row 2: Weekly Chart + Right Panel ── */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <WeeklyReport data={weeklyData} loading={loading} />

        <div className="flex flex-col gap-4">
         
          <TopProducts products={topProducts} loading={loading} />
        </div>
      </motion.div>

      {/* ── Row 3: Recent Transactions ── */}
      <motion.div variants={fadeInUp} className="flex w-full">
        <TransactionsTable transactions={recentTx} loading={loading} />
      </motion.div>
    </motion.div>
  )
}
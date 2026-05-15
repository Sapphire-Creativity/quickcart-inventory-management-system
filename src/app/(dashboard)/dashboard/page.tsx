"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Home Page — Updated with new reusable stat components
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { motion } from "framer-motion";
import { FiDollarSign, FiShoppingBag, FiClock } from "react-icons/fi";
import { StatCard } from "@/components/dashboard/StatCard";
import { DualStatCard } from "@/components/dashboard/DualStatCard";
import {
  WeeklyReport,
  UsersWidget,
   
  TopProducts,
} from "@/components/dashboard";

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-5 max-w-[1400px]"
    >
      {/* ── Row 1: KPI Stat Cards ── */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Sales */}
        <StatCard
          title="Total Sales"
          subtitle="Last 7 days"
          value="350"
          valuePrefix="$"
          valueSuffix="K"
          change={10.4}
          changeLabel="vs. previous 7 days ($235k)"
          icon={FiDollarSign}
          variant="success"
          onDetails={() => console.log('View sales details')}
        />

        {/* Total Orders */}
        <StatCard
          title="Total Orders"
          subtitle="Last 7 days"
          value="10.7"
          valueSuffix="K"
          change={14.4}
          changeLabel="vs. previous 7 days (7.6k)"
          icon={FiShoppingBag}
          variant="success"
          onDetails={() => console.log('View orders details')}
        />

        {/* Pending & Cancelled */}
        <DualStatCard
          title="Pending & Cancelled"
          subtitle="Last 7 days"
          icon={FiClock}
          variant="warning"
          stats={[
            {
              label: "Pending",
              value: "509",
              subtext: "204 users"
            },
            {
              label: "Cancelled",
              value: "94",
              change: -14.4,
              subtext: "This week"
            }
          ]}
          onDetails={() => console.log('View pending details')}
        />
      </motion.div>

      {/* ── Row 2: Weekly Chart + Right Panel ── */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <WeeklyReport />

        <div className="flex flex-col gap-4">
          <UsersWidget />
          <TopProducts />
        </div>
      </motion.div>


      <motion.div variants={fadeInUp} className="flex w-full">
        {/* <TransactionsTable /> */}

      </motion.div>
    </motion.div>
  );
}
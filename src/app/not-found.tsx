'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { HiOutlineHome, HiOutlineArrowLeft, HiOutlineShoppingBag } from 'react-icons/hi'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="text-center max-w-md w-full"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-24 h-24 bg-surface border border-default rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm"
        >
          <HiOutlineShoppingBag className="w-12 h-12 text-muted" />
        </motion.div>

        {/* 404 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3"
        >
          Error 404
        </motion.p>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight"
        >
          Page not found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-muted mb-8 leading-relaxed"
        >
          The page you're looking for doesn't exist or has been moved.
          Check the URL or head back to the dashboard.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/dashboard" className="btn btn-primary w-full sm:w-auto">
            <HiOutlineHome className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary w-full sm:w-auto"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineHome,
  HiOutlineArrowLeft,
} from 'react-icons/hi'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DashboardError]', error)
  }, [error])

  return (
    <div className="flex items-center justify-center h-[calc(100vh-120px)] p-6">
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
          transition={{ delay: 0.1 }}
          className="w-20 h-20 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <HiOutlineExclamationCircle className="w-10 h-10 text-red-500" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-2"
        >
          Error
        </motion.p>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight"
        >
          Something went wrong
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-muted mb-4 leading-relaxed text-sm"
        >
          {error.message || 'An unexpected error occurred loading this page.'}
          {' '}Try again or go back to the dashboard.
        </motion.p>

        {/* Error digest */}
        {error.digest && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="text-xs text-muted font-mono bg-gray-50 border border-default rounded-lg px-3 py-2 mb-6"
          >
            Error ID: {error.digest}
          </motion.p>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button onClick={reset} className="btn btn-primary w-full sm:w-auto">
            <HiOutlineRefresh className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary w-full sm:w-auto"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link href="/dashboard" className="btn btn-secondary w-full sm:w-auto">
            <HiOutlineHome className="w-4 h-4" />
            Dashboard
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
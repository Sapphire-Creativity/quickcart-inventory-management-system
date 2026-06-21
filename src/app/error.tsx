'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineExclamationCircle, HiOutlineRefresh, HiOutlineHome } from 'react-icons/hi'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
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
              className="w-24 h-24 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-8"
            >
              <HiOutlineExclamationCircle className="w-12 h-12 text-red-500" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-3"
            >
              Something went wrong
            </motion.p>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight"
            >
              Unexpected error
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-neutral-500 mb-4 leading-relaxed"
            >
              An unexpected error occurred. Try refreshing the page — if
              the problem persists, contact support.
            </motion.p>

            {/* Error digest for debugging */}
            {error.digest && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="text-xs text-neutral-400 font-mono bg-neutral-100 rounded-lg px-3 py-2 mb-6"
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
              <Link href="/dashboard" className="btn btn-secondary w-full sm:w-auto">
                <HiOutlineHome className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </body>
    </html>
  )
}
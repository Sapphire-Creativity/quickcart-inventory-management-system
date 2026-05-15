'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ShoppingCart, X } from '@/components/icons'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SignOutModalProps {
    isOpen: boolean
    onClose: () => void
    user: {
        name: string
        email: string
        avatar: string
    }
}

export function SignOutModal({ isOpen, onClose, user }: SignOutModalProps) {
    const { signOut } = useClerk()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleSignOut = async () => {
        setIsLoading(true)
        await signOut()
        router.replace('/auth') // change to your sign-in route
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                       w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-neutral-200/60
                       border border-neutral-200/60 overflow-hidden"
                    >
                        {/* Top accent bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-red-400 to-rose-500" />

                        <div className="p-6">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400
                           hover:bg-neutral-100 hover:text-neutral-600 transition-all"
                            >
                                <X size={16} />
                            </button>

                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100
                              flex items-center justify-center mx-auto mb-4">
                                <LogOut size={24} className="text-red-500" />
                            </div>

                            {/* Text */}
                            <div className="text-center mb-6">
                                <h2 className="text-lg font-bold text-neutral-900 mb-1">
                                    Sign out?
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    You're signing out of your account
                                </p>
                            </div>

                            {/* User pill */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50
                              border border-neutral-200/60 mb-6">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-neutral-100"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-neutral-800 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium
                             bg-neutral-100 text-neutral-700
                             hover:bg-neutral-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>

                                <motion.button
                                    onClick={handleSignOut}
                                    disabled={isLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                             bg-gradient-to-r from-red-500 to-rose-500 text-white
                             hover:from-red-600 hover:to-rose-600
                             shadow-lg shadow-red-500/25 transition-all duration-200
                             flex items-center justify-center gap-2
                             disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <LogOut size={15} />
                                            Sign Out
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
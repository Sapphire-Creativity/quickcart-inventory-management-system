'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import KPICard from '@/components/dashboard/KPICard'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import {
    HiOutlineSearch, HiOutlineFilter, HiOutlineRefresh,
    HiOutlineCurrencyDollar, HiOutlineCheckCircle, HiOutlineXCircle,
    HiOutlineChevronLeft, HiOutlineChevronRight,
    HiOutlineReceiptTax, HiOutlineShoppingBag,
    HiOutlineUser, HiOutlineCalendar, HiOutlineCreditCard,
    HiOutlineExclamationCircle, HiX, HiOutlineCheck,
    HiOutlineArrowNarrowUp, HiOutlineArrowNarrowDown, HiOutlineEye,
} from 'react-icons/hi'

import {
    getTransactions,
    type GetTransactionsOptions,
} from '@/actions/transactions'

// ── Types ──────────────────────────────────────────────────

type AnyTransaction = Awaited<ReturnType<typeof getTransactions>>['data'] extends (infer T)[] | null ? T : never

// ── Config ─────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    sale: { label: 'Sale', className: 'bg-emerald-100 text-emerald-700', icon: <HiOutlineArrowNarrowUp className="w-3.5 h-3.5" /> },
    refund: { label: 'Refund', className: 'bg-red-100 text-red-700', icon: <HiOutlineArrowNarrowDown className="w-3.5 h-3.5" /> },
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
}

const PAYMENT_LABELS: Record<string, string> = {
    cash: 'Cash', card: 'Card', transfer: 'Transfer', other: 'Other',
}

// ── Helpers ────────────────────────────────────────────────

const TypeBadge = ({ type }: { type: string }) => {
    const cfg = TYPE_CONFIG[type] ?? { label: type, className: 'bg-gray-100 text-gray-600', icon: null }
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
            {cfg.icon}{cfg.label}
        </span>
    )
}

const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
}

const Spinner = ({ sm }: { sm?: boolean }) => (
    <div className={`${sm ? 'w-4 h-4 border-2' : 'w-8 h-8 border-[3px]'} border-brand-500 border-t-transparent rounded-full animate-spin`} />
)

const Toast = ({ message, type, onDismiss }: { message: string; type: 'success' | 'error'; onDismiss: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
    >
        {type === 'success'
            ? <HiOutlineCheck className="w-4 h-4 flex-shrink-0" />
            : <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0" />}
        <span>{message}</span>
        <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100"><HiX className="w-4 h-4" /></button>
    </motion.div>
)

// ── Transaction Details Drawer ─────────────────────────────

const TransactionDrawer = ({
    transaction, isOpen, onClose,
}: {
    transaction: AnyTransaction | null
    isOpen: boolean
    onClose: () => void
}) => {
    const order = (transaction?.orders as any) ?? null
    const customer = order?.customers ?? null

    return (
        <AnimatePresence>
            {isOpen && transaction && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.28 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-xl z-50 flex flex-col"
                    >
                        <div className="sticky top-0 bg-surface border-b border-default p-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Transaction Details</h2>
                                <p className="text-xs text-muted font-mono mt-0.5">{transaction.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Amount hero */}
                            <div className={`rounded-xl p-6 text-center ${transaction.type === 'sale'
                                    ? 'bg-emerald-50 border border-emerald-100'
                                    : 'bg-red-50 border border-red-100'
                                }`}>
                                <p className={`text-4xl font-bold ${transaction.type === 'sale' ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {transaction.type === 'refund' ? '−' : '+'}${Number(transaction.amount).toFixed(2)}
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <TypeBadge type={transaction.type} />
                                    <StatusBadge status={transaction.status} />
                                </div>
                                <p className="text-sm text-muted mt-2">{new Date(transaction.created_at).toLocaleString()}</p>
                            </div>

                            {/* Linked order */}
                            {order && (
                                <div className="border border-default rounded-xl p-4">
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <HiOutlineShoppingBag className="w-4 h-4 text-muted" /> Linked Order
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted">Order Number</span>
                                            <span className="font-mono font-medium">{order.order_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted">Order Total</span>
                                            <span className="font-medium">${Number(order.total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Customer */}
                            {customer && (
                                <div className="border border-default rounded-xl p-4">
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <HiOutlineUser className="w-4 h-4 text-muted" /> Customer
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium">{customer.name}</p>
                                        {customer.email && <p className="text-muted">{customer.email}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Payment details */}
                            <div className="border border-default rounded-xl p-4">
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <HiOutlineCreditCard className="w-4 h-4 text-muted" /> Payment Details
                                </h3>
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Method</span>
                                        <span>{PAYMENT_LABELS[transaction.payment_method ?? ''] ?? transaction.payment_method ?? '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted">Type</span>
                                        <TypeBadge type={transaction.type} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted">Status</span>
                                        <StatusBadge status={transaction.status} />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Date</span>
                                        <span>{new Date(transaction.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-default font-semibold">
                                        <span>Amount</span>
                                        <span className={transaction.type === 'refund' ? 'text-red-600' : 'text-emerald-600'}>
                                            {transaction.type === 'refund' ? '−' : '+'}${Number(transaction.amount).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// ── Export helper ──────────────────────────────────────────

function exportToCSV(transactions: AnyTransaction[]) {
    const headers = ['ID', 'Date', 'Order', 'Customer', 'Type', 'Status', 'Payment Method', 'Amount']
    const rows = transactions.map(t => {
        const order = t.orders as any
        const customer = order?.customers as any
        return [
            t.id,
            new Date(t.created_at).toLocaleString(),
            order?.order_number ?? '—',
            customer?.name ?? '—',
            t.type,
            t.status,
            t.payment_method ?? '—',
            Number(t.amount).toFixed(2),
        ]
    })
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

// ── Main Page ──────────────────────────────────────────────

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<AnyTransaction[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const PAGE_SIZE = 20

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'refund'>('all')
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // UI state
    const [selectedTx, setSelectedTx] = useState<AnyTransaction | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }, [])

    const fetchTransactions = useCallback(async (
        page = currentPage,
        type = typeFilter,
        status = statusFilter,
        from = fromDate,
        to = toDate,
    ) => {
        setIsLoading(true)
        const options: GetTransactionsOptions = {
            page,
            pageSize: PAGE_SIZE,
            type: type !== 'all' ? type : undefined,
            status: status !== 'all' ? status : undefined,
            from_date: from || undefined,
            to_date: to || undefined,
        }
        const { data, count, error } = await getTransactions(options)
        setIsLoading(false)
        if (error) { showToast(error, 'error'); return }
        setTransactions(data ?? [])
        setTotalCount(count ?? 0)
    }, [currentPage, typeFilter, statusFilter, fromDate, toDate, showToast])

    useEffect(() => { fetchTransactions(1) }, [])

    useEffect(() => {
        setCurrentPage(1)
        fetchTransactions(1, typeFilter, statusFilter, fromDate, toDate)
    }, [typeFilter, statusFilter, fromDate, toDate])

    useEffect(() => { fetchTransactions(currentPage) }, [currentPage])

    // Client-side search on current page
    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return transactions
        const q = searchQuery.toLowerCase()
        return transactions.filter(t => {
            const order = t.orders as any
            const customer = order?.customers as any
            return (
                order?.order_number?.toLowerCase().includes(q) ||
                customer?.name?.toLowerCase().includes(q) ||
                customer?.email?.toLowerCase().includes(q)
            )
        })
    }, [transactions, searchQuery])

    const kpis = useMemo(() => ({
        totalRevenue: transactions.filter(t => t.type === 'sale' && t.status === 'completed').reduce((s, t) => s + Number(t.amount), 0),
        totalRefunds: transactions.filter(t => t.type === 'refund' && t.status === 'completed').reduce((s, t) => s + Number(t.amount), 0),
        completedCount: transactions.filter(t => t.status === 'completed').length,
        failedCount: transactions.filter(t => t.status === 'failed').length,
    }), [transactions])

    const netTotal = filtered.reduce((s, t) => s + (t.type === 'refund' ? -Number(t.amount) : Number(t.amount)), 0)
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)
    const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || fromDate || toDate

    const clearFilters = () => {
        setTypeFilter('all'); setStatusFilter('all'); setFromDate(''); setToDate(''); setSearchQuery('')
    }

    return (
        <>
            <div className="space-y-6">
                <DashboardHeader
                    title="Transactions"
                    subTitle="View and track all payment transactions"
                    button={{
                        text: 'Export CSV',
                        onClick: () => {
                            if (transactions.length === 0) { showToast('No transactions to export', 'error'); return }
                            exportToCSV(transactions)
                            showToast(`Exported ${transactions.length} transactions`)
                        },
                    }}
                />

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title="Revenue (page)" value={`$${kpis.totalRevenue.toFixed(2)}`} icon={HiOutlineCurrencyDollar} color="bg-emerald-500" />
                    <KPICard title="Refunds (page)" value={`$${kpis.totalRefunds.toFixed(2)}`} icon={HiOutlineReceiptTax} color="bg-red-500" />
                    <KPICard title="Completed" value={kpis.completedCount} icon={HiOutlineCheckCircle} color="bg-blue-500" />
                    <KPICard title="Failed" value={kpis.failedCount} icon={HiOutlineXCircle} color="bg-gray-500" />
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by order number or customer..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="input pl-9"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        <button onClick={() => setShowFilters(f => !f)} className="btn btn-secondary lg:hidden">
                            <HiOutlineFilter className="w-4 h-4" /> Filters
                        </button>
                        <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex gap-2 flex-wrap items-center`}>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="input w-auto">
                                <option value="all">All Types</option>
                                <option value="sale">Sale</option>
                                <option value="refund">Refund</option>
                            </select>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="input w-auto">
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                            <div className="flex items-center gap-1.5">
                                <div className="relative">
                                    <HiOutlineCalendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={e => setFromDate(e.target.value)}
                                        className="input pl-8 w-36 text-sm"
                                    />
                                </div>
                                <span className="text-muted text-sm">–</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    className="input w-36 text-sm"
                                />
                            </div>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="btn btn-ghost text-sm text-muted hover:text-red-500 flex items-center gap-1">
                                    <HiX className="w-4 h-4" /> Clear
                                </button>
                            )}
                            <button onClick={() => fetchTransactions(currentPage)} className="btn btn-secondary" title="Refresh">
                                <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table — Desktop */}
                <div className="hidden lg:block bg-surface rounded-xl border border-default overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="flex justify-center py-16"><Spinner /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50/50 border-b border-default">
                                    <tr>
                                        {['Date', 'Order', 'Customer', 'Method', 'Type', 'Status', 'Amount', ''].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="wait">
                                        {filtered.map(tx => {
                                            const order = tx.orders as any
                                            const customer = order?.customers as any
                                            const isRefund = tx.type === 'refund'
                                            return (
                                                <motion.tr
                                                    key={tx.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => { setSelectedTx(tx); setIsDrawerOpen(true) }}
                                                    className="border-b border-default hover:bg-gray-50/50 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                                                        {new Date(tx.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {order
                                                            ? <span className="font-mono font-medium">{order.order_number}</span>
                                                            : <span className="text-muted">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {customer ? (
                                                            <div>
                                                                <p className="font-medium">{customer.name}</p>
                                                                {customer.email && <p className="text-xs text-muted">{customer.email}</p>}
                                                            </div>
                                                        ) : <span className="text-muted">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted">
                                                        {PAYMENT_LABELS[tx.payment_method ?? ''] ?? tx.payment_method ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3"><TypeBadge type={tx.type} /></td>
                                                    <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                                                    <td className="px-4 py-3">
                                                        <span className={`font-semibold ${isRefund ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            {isRefund ? '−' : '+'}${Number(tx.amount).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => { setSelectedTx(tx); setIsDrawerOpen(true) }}
                                                            className="p-1.5 rounded-md hover:bg-gray-100 transition"
                                                        >
                                                            <HiOutlineEye className="w-4 h-4 text-muted" />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            )
                                        })}
                                    </AnimatePresence>
                                </tbody>

                                {/* Page net total footer */}
                                {filtered.length > 0 && (
                                    <tfoot className="bg-gray-50/50 border-t-2 border-default">
                                        <tr>
                                            <td colSpan={6} className="px-4 py-3 text-xs font-medium text-muted">
                                                Page net ({filtered.length} transactions)
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`font-bold ${netTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {netTotal >= 0 ? '+' : ''}${netTotal.toFixed(2)}
                                                </span>
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    )}
                </div>

                {/* Cards — Mobile */}
                <div className="lg:hidden space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><Spinner /></div>
                    ) : filtered.map(tx => {
                        const order = tx.orders as any
                        const customer = order?.customers as any
                        const isRefund = tx.type === 'refund'
                        return (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => { setSelectedTx(tx); setIsDrawerOpen(true) }}
                                className="bg-surface rounded-xl border border-default p-4 shadow-sm cursor-pointer active:opacity-80"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        {order && <p className="font-mono font-semibold text-sm">{order.order_number}</p>}
                                        <p className="text-xs text-muted">{new Date(tx.created_at).toLocaleString()}</p>
                                    </div>
                                    <span className={`text-xl font-bold ${isRefund ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {isRefund ? '−' : '+'}${Number(tx.amount).toFixed(2)}
                                    </span>
                                </div>
                                {customer && <p className="text-sm font-medium mb-2">{customer.name}</p>}
                                <div className="flex items-center gap-2 pt-2 border-t border-default">
                                    <TypeBadge type={tx.type} />
                                    <StatusBadge status={tx.status} />
                                    <span className="text-xs text-muted ml-auto">
                                        {PAYMENT_LABELS[tx.payment_method ?? ''] ?? tx.payment_method ?? '—'}
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Empty state */}
                {!isLoading && filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-default"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <HiOutlineReceiptTax className="w-8 h-8 text-muted" />
                        </div>
                        <h3 className="text-lg font-medium">No transactions found</h3>
                        <p className="text-muted mt-1 text-sm">
                            {hasActiveFilters
                                ? 'Try adjusting your filters'
                                : 'Transactions are created automatically when orders are completed'}
                        </p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="btn btn-secondary mt-4">Clear Filters</button>
                        )}
                    </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <p className="text-sm text-muted">
                            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border border-default disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let n = i + 1
                                if (totalPages > 5) {
                                    if (currentPage <= 3) n = i + 1
                                    else if (currentPage >= totalPages - 2) n = totalPages - 4 + i
                                    else n = currentPage - 2 + i
                                }
                                return (
                                    <button key={n} onClick={() => setCurrentPage(n)}
                                        className={`px-3 py-1 rounded-md text-sm transition ${currentPage === n ? 'bg-brand-500 text-white' : 'border border-default hover:bg-gray-50'
                                            }`}
                                    >{n}</button>
                                )
                            })}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md border border-default disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Drawer */}
            <TransactionDrawer
                transaction={selectedTx}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />

            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
            </AnimatePresence>
        </>
    )
}
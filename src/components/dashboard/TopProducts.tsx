'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { HiOutlineSearch, HiOutlinePhotograph } from 'react-icons/hi'
import type { TopProduct } from '@/actions/dashboard'

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-neutral-100 rounded-xl ${className}`} />
)

export function TopProducts({
  products,
  loading,
}: {
  products: TopProduct[] | null
  loading: boolean
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!products) return []
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q)
    )
  }, [products, query])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="card p-5 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading">Top Products</h3>
        <span className="text-xs text-neutral-400">by units sold</span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <HiOutlineSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search products…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-brand-400 focus:border-brand-400 transition"
          aria-label="Search products"
        />
      </div>

      {/* List */}
      <div className="space-y-1.5 flex-1">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5">
              <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="w-3/4 h-3" />
                <Skeleton className="w-1/2 h-2.5" />
              </div>
              <Skeleton className="w-12 h-4" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-4">
            {query ? 'No products found' : 'No sales data yet'}
          </p>
        ) : (
          filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.06, duration: 0.22 }}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors -mx-1 cursor-default"
            >
              {/* Image or placeholder */}
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HiOutlinePhotograph className="w-5 h-5 text-neutral-300" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-neutral-800 truncate">{p.name}</p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {p.sku ? `SKU ${p.sku}` : '—'} · {p.unitsSold} sold
                </p>
              </div>

              {/* Price */}
              <span className="text-[13px] font-bold text-neutral-900 flex-shrink-0">
                ${p.price.toFixed(2)}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
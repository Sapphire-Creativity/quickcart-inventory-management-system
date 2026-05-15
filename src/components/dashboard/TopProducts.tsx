"use client";

// ─────────────────────────────────────────────────────────────────────────────
// TopProducts — Best-selling products list with search
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "@/components/icons";
import { Input } from "@/components/ui";
import { TOP_PRODUCTS } from "@/constants";

export function TopProducts() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      TOP_PRODUCTS.filter(
        (p) =>
          query.trim() === "" ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

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
        <button className="text-[12px] font-medium text-[var(--color-brand-600)] hover:underline">
          View all
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          inputSize="sm"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftAdornment={<Search size={13} />}
          aria-label="Search products"
        />
      </div>

      {/* Product list */}
      <div className="space-y-1.5 flex-1">
        {filtered.length === 0 && (
          <p className="text-caption text-center py-4">No products found</p>
        )}
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.06, duration: 0.22 }}
            className="card-interactive flex items-center gap-3 p-2.5 -mx-1"
          >
            {/* Product icon */}
            <div
              className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: p.color }}
            >
              {p.emoji}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p
                className="truncate text-[var(--color-text-primary)]"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                {p.name}
              </p>
              <p className="text-caption truncate">SKU {p.sku}</p>
            </div>

            {/* Price */}
            <span
              className="shrink-0 text-[var(--color-text-primary)]"
              style={{ fontSize: 13, fontWeight: 700 }}
            >
              {p.price}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

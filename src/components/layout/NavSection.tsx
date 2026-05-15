"use client";

// ─────────────────────────────────────────────────────────────────────────────
// NavSection — Sidebar navigation group with animated items
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NavItem } from "../../../types";

interface NavSectionProps {
  label: string;
  items: NavItem[];
  collapsed: boolean;
}

export function NavSection({ label, items, collapsed }: NavSectionProps) {
  return (
    <div>
      {!collapsed && (
        <p className="nav-section-label mb-2 mt-1">{label}</p>
      )}
      <ul className="space-y-0.5" role="list">
        {items.map((item) => (
          <li key={item.label}>
            <motion.a
              href={item.href ?? "#"}
              whileHover={{ x: collapsed ? 0 : 3 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "nav-item",
                item.active && "active",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
              aria-current={item.active ? "page" : undefined}
            >
              <item.icon size={17} className="shrink-0" />

              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 truncate"
                >
                  {item.label}
                </motion.span>
              )}

              {!collapsed && item.badge !== undefined && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-auto text-[10px] font-bold bg-[var(--color-brand-500)] text-white rounded-full w-4 h-4 flex items-center justify-center leading-none"
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.a>
          </li>
        ))}
      </ul>
    </div>
  );
}

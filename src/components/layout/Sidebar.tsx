"use client";
import { useState } from 'react'
import { SignOutModal } from '@/components/ui/SignOutModal'
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  ChevronLeft, ChevronRight, LogOut, ExternalLink, ShoppingCart,
  LayoutDashboard, Users, Tag, Grid3X3, CreditCard, Bookmark,
  PlusCircle, ImageIcon, List, Star, ShieldCheck, Settings2,
} from "@/components/icons";
import { useUser } from '@clerk/nextjs';



// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    section: "Main menu",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", badge: "3" },
      { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders", badge: "12" },
      { icon: Users, label: "Customers", href: "/dashboard/customers" },
      { icon: CreditCard, label: "Transactions", href: "/dashboard/transactions" },
    ]
  },
  {
    section: "Products",
    items: [
      { icon: PlusCircle, label: "Add Product", href: "/dashboard/add-product", highlight: true },
      { icon: List, label: "All Products", href: "/dashboard/products", badge: "156" },
    ]
  },
  {
    section: "Admin",
    items: [
      { icon: ShieldCheck, label: "Roles", href: "/admin/roles" },
      { icon: Settings2, label: "Authority", href: "/admin/authority" },
    ]
  },
];

const STATS = [
  { icon: ShoppingCart, label: "Orders", value: "1,243", change: "+8.2%" },
  { icon: Users, label: "Customers", value: "5,420", change: "+12.5%" },
];

const USER = {
  name: "Dealport Store",
  email: "mark@thedesigner.io",
  avatar: "https://i.pravatar.cc/40?img=12",
  shopUrl: "https://dealport.shop",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Sidebar Component
// ─────────────────────────────────────────────────────────────────────────────

export function Sidebar({ collapsed, onToggle }) {
  const { user } = useUser();
  const pathname = usePathname();
  const [showSignOut, setShowSignOut] = useState(false)

  console.log(user)
  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen flex flex-col bg-gradient-to-b from-white via-white to-neutral-50/50 border-r border-neutral-200/60 shadow-xl shadow-neutral-200/20"
    >

      <>




        {/* Header */}
        <div className="relative flex items-center gap-3 px-5 h-16 border-b border-neutral-200/60">
          {/* Logo */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <ShoppingCart className="text-white" size={16} />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent"
                >
                  Menuly
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="p-2 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 transition-all duration-200"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </motion.button>
        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y- custom-scrollbar">
          {NAV_ITEMS.map(({ section, items }) => (
            <div key={section}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2 px-2 mb-2"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      {section}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-neutral-200 to-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>

              <ul className="space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.label}>
                      <motion.a
                        href={item.href}
                        whileHover={{ x: collapsed ? 0 : 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                        relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl w-full
                        transition-all duration-200 group
                        ${isActive
                            ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25"
                            : item.highlight
                              ? "bg-gradient-to-r from-brand-50 to-brand-100/50 text-brand-600 hover:from-brand-100 hover:to-brand-200/50 border border-brand-200"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                          }
                        ${collapsed ? "justify-center px-2" : ""}
                      `}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon size={18} className={isActive ? "text-white" : ""} />

                        {!collapsed && (
                          <span className="truncate flex-1">{item.label}</span>
                        )}

                        {/* Badge */}
                        {!collapsed && item.badge && (
                          <span className={`
                          px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                          ${isActive
                              ? "bg-white/20 text-white"
                              : "bg-neutral-200/60 text-neutral-600 group-hover:bg-neutral-300/60"
                            }
                        `}>
                            {item.badge}
                          </span>
                        )}

                        {/* Active indicator for collapsed mode */}
                        {collapsed && isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute right-0 w-1 h-4 bg-white rounded-l-full"
                          />
                        )}
                      </motion.a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-neutral-200/60 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={USER.avatar}
                alt={USER.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-neutral-100"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-semibold truncate text-neutral-800">
                    {USER.name}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!collapsed && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSignOut(true)}  // ← was missing
                className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 text-neutral-400 transition-all duration-200"
              >
                <LogOut size={16} />
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <a
                  href={USER.shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-neutral-50 to-neutral-100 text-neutral-700 border border-neutral-200/60 rounded-xl hover:from-neutral-100 hover:to-neutral-200 hover:border-neutral-300 transition-all duration-200 group"
                >
                   
                  <motion.span
                    whileHover={{ x: 3 }}
                    className="text-[11px] text-neutral-400 group-hover:text-neutral-600"
                  >
                    ↗
                  </motion.span>
                </a>
              </motion.div>


            )}
          </AnimatePresence>
        </div>

        {/*  */}
        <SignOutModal
          isOpen={showSignOut}
          onClose={() => setShowSignOut(false)}
          user={USER}
        />




        {/* Custom scrollbar styles */}
        <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
      </>
    </motion.aside>
  );
}
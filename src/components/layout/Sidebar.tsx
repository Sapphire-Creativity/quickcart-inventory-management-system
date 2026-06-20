"use client";

import { useState } from 'react'
import { SignOutModal } from '@/components/ui/SignOutModal'
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from '@clerk/nextjs';
import {
  ChevronLeft, ChevronRight, LogOut, ShoppingCart,
  LayoutDashboard, Users, CreditCard,
  PlusCircle, List,
} from "@/components/icons";

const NAV_ITEMS = [
  {
    section: "Main menu",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders" },
      { icon: Users, label: "Customers", href: "/dashboard/customers" },
      { icon: CreditCard, label: "Transactions", href: "/dashboard/transactions" },
    ],
  },
  {
    section: "Products",
    items: [
      { icon: PlusCircle, label: "Add Product", href: "/dashboard/add-product", highlight: true },
      { icon: List, label: "All Products", href: "/dashboard/products" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [showSignOut, setShowSignOut] = useState(false);


  const displayName = user?.fullName
    ?? user?.firstName
    ?? user?.username
    ?? 'Admin';

  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? '';

  const displayAvatar = user?.imageUrl ?? null;

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const storeName = (user?.unsafeMetadata?.storeName as string) ?? 'My Store'

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-screen flex flex-col bg-gradient-to-b from-white via-white to-neutral-50/50 border-r border-neutral-200/60 shadow-xl shadow-neutral-200/20 flex-shrink-0"
      >
        {/* Header */}
        <div className="relative flex items-center gap-3 px-5 h-16 border-b border-neutral-200/60">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 flex-shrink-0">
              <ShoppingCart className="text-white" size={16} />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent whitespace-nowrap"
                >
                  QuickCart
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle — hidden on md, visible on lg+ */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="hidden lg:flex p-2 rounded-xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 transition-all duration-200"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">
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
                        title={item.label}
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
                      >
                        <item.icon size={18} className={isActive ? "text-white" : ""} />

                        {!collapsed && (
                          <span className="truncate flex-1">{item.label}</span>
                        )}

                        {collapsed && isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute right-0 w-1 h-4 bg-brand-500 rounded-l-full"
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
        <div className="border-t border-neutral-200/60 p-4 space-y-2">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {isLoaded && displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-neutral-100"
                />
              ) : (
                // Fallback initials avatar while loading or if no image
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center ring-2 ring-neutral-100">
                  <span className="text-white text-xs font-bold">
                    {isLoaded ? initials : '..'}
                  </span>
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            </div>

            {/* Name, Store Name, Email */}
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-semibold truncate text-neutral-800">
                    {isLoaded ? displayName : 'Loading...'}
                  </p>
                  <p className="text-sm font-semibold truncate text-neutral-800">
                    {isLoaded ? storeName : 'Loading...'}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {isLoaded ? displayEmail : ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign out button */}
            {!collapsed && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSignOut(true)}
                className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 text-neutral-400 transition-all duration-200 flex-shrink-0"
                title="Sign out"
              >
                <LogOut size={16} />
              </motion.button>
            )}
          </div>

          {/* Sign out button in collapsed mode */}
          {collapsed && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSignOut(true)}
              className="w-full flex justify-center p-2 rounded-xl hover:bg-red-50 hover:text-red-500 text-neutral-400 transition-all duration-200"
              title="Sign out"
            >
              <LogOut size={16} />
            </motion.button>
          )}
        </div>
      </motion.aside>

      <SignOutModal
        isOpen={showSignOut}
        onClose={() => setShowSignOut(false)}
        onConfirm={() => signOut({ redirectUrl: '/' })}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </>
  );
}
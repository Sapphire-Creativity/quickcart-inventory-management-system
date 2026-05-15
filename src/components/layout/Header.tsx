"use client";

import React from "react";
import { FiSearch, FiBell, FiSun } from "react-icons/fi";

const USER_PROFILE = {
  name: "Mark Chen",
  avatarUrl: "https://i.pravatar.cc/40?img=12",
};

export function Header({ title = "Dashboard" }) {
  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center gap-4 px-6 shrink-0 z-10">
      {/* Page title */}
      <h1 className="shrink-0 text-neutral-900 text-[17px] font-bold tracking-tight">
        {title}
      </h1>

      {/* Search */}
      <div className="flex-1 max-w-sm ml-auto">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
          <input
            type="text"
            placeholder="Search orders, customers…"
            className="w-full h-9 pl-9 pr-3 text-sm bg-neutral-50 border border-neutral-200 rounded-lg 
                       placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-2 
                       focus:ring-brand-500/20 focus:bg-white transition-all duration-200"
            aria-label="Search"
          />
        </div>
      </div>

      {/* Action group */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 
                       transition-all duration-200"
            aria-label="Notifications"
          >
            <FiBell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" 
                  aria-label="Unread notifications" />
          </button>
        </div>

        {/* Theme toggle */}
        <button
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 
                     transition-all duration-200"
          aria-label="Toggle theme"
        >
          <FiSun size={16} />
        </button>

        {/* Avatar */}
        <div className="relative ml-1">
          <div className="w-8 h-8 rounded-full ring-2 ring-neutral-200 ring-offset-1 overflow-hidden">
            <img 
              src={USER_PROFILE.avatarUrl} 
              alt={USER_PROFILE.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Layout — Sidebar + Header shell for all dashboard routes
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useSidebar } from "@/hooks";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed, toggle } = useSidebar(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar collapsed={collapsed} onToggle={toggle} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header title="Dashboard" />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          style={{ padding: "24px" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

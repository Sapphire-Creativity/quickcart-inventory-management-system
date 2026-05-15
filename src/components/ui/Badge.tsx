// ─────────────────────────────────────────────────────────────────────────────
// Badge — Reusable status / label badge
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";
type BadgeSize    = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: "badge-success",
  warning: "badge-warning",
  danger:  "badge-danger",
  info:    "badge-info",
  default: "bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "text-[11px] py-[3px] px-[8px]",
  md: "text-[12px] py-[4px] px-[10px]",
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        dot && "badge-dot",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Convenience: Transaction status badge with auto-variant mapping */
export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    Paid:      "success",
    Pending:   "warning",
    Cancelled: "danger",
    Active:    "success",
    Inactive:  "default",
    Refunded:  "info",
  };
  return (
    <Badge variant={variantMap[status] ?? "default"} dot>
      {status}
    </Badge>
  );
}

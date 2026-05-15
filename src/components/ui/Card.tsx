// ─────────────────────────────────────────────────────────────────────────────
// Card — Flexible container component with header/body/footer slots
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "interactive";

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default:     "card",
  elevated:    "card-md",
  interactive: "card-interactive",
};

export function Card({ variant = "default", className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(VARIANT_CLASSES[variant], className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 mb-4", className)}>
      <div className="min-w-0">
        <h3 className="text-heading truncate">{title}</h3>
        {subtitle && (
          <p className="text-caption mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex-1", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-[var(--color-border)]", className)}>
      {children}
    </div>
  );
}

// ── Navigation ────────────────────────────────────────────────────────────────
export type IconComponent = React.ComponentType<{
  size?: number;
  className?: string;
}>;

export interface NavItem {
  icon: IconComponent;
  label: string;
  href?: string;
  active?: boolean;
  badge?: number;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// ── Chart Data ─────────────────────────────────────────────────────────────────
export interface WeeklyDataPoint {
  day: string;
  value: number;
}

export interface MinuteDataPoint {
  t: string;
  v: number;
}

export type ActiveWeek = "this" | "last";

// ── Dashboard Metrics ──────────────────────────────────────────────────────────
export interface WeeklyMetric {
  label: string;
  value: string;
  active?: boolean;
}

export interface StatCardData {
  title: string;
  period: string;
  value: string;
  unit?: string;
  trend?: number;
  trendDirection?: "up" | "down";
  previousPeriodLabel?: string;
  previousPeriodValue?: string;
}

// ── Transactions ───────────────────────────────────────────────────────────────
export type TransactionStatus = "Paid" | "Pending" | "Cancelled";

export interface Transaction {
  id: number;
  customerId: string;
  orderDate: string;
  status: TransactionStatus;
  amount: string;
}

// ── Products ───────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  emoji: string;
  color: string;
  category?: string;
  stock?: number;
}

// ── Countries / Regions ────────────────────────────────────────────────────────
export interface CountrySalesData {
  name: string;
  value: string;
  change: string;
  trendUp: boolean;
  flag: string;
  barPercent: number;
}

// ── User Profile ───────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  shopUrl?: string;
}

// ── Component Prop Interfaces ──────────────────────────────────────────────────
export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export interface BadgeVariant {
  variant: "success" | "warning" | "danger" | "info" | "default";
}

export interface ButtonVariant {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

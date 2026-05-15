// ─────────────────────────────────────────────────────────────────────────────
// DEALPORT — Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/** Merge class names (lightweight cn utility without clsx dependency) */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format number to compact notation: 1500 → "1.5k", 1000000 → "1M" */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}k`;
  return value.toString();
}

/** Format currency: 1999.5 → "$1,999.50" */
export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format percentage with sign: 10.4 → "+10.4%", -5.2 → "-5.2%" */
export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/** Truncate string to max length with ellipsis */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return `${str.slice(0, max - 3)}...`;
}

/** Sleep for n milliseconds (for async demos / delays) */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Clamp number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

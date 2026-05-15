"use server";

import { createServerClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────

export type GetTransactionsOptions = {
  page?: number;
  pageSize?: number;
  order_id?: string;
  from_date?: string;
  to_date?: string;
  type?: "sale" | "refund";
  status?: "pending" | "completed" | "failed";
};

// ── Transactions ───────────────────────────────────────────

/**
 * Get a paginated list of transactions with their linked order info.
 * Transactions are auto-created by updateOrderStatus() when an order
 * is marked as completed — you don't create them manually.
 */
export async function getTransactions(options: GetTransactionsOptions = {}) {
  const supabase = await createServerClient();
  const {
    page = 1,
    pageSize = 20,
    order_id,
    from_date,
    to_date,
    type,
    status,
  } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("transactions")
    .select(
      `
      id, amount, type, status, payment_method, created_at,
      orders(id, order_number, total, customer_id,
        customers(id, name, email)
      )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (order_id) {
    query = query.eq("order_id", order_id);
  }

  if (type) {
    query = query.eq("type", type);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (from_date) {
    query = query.gte("created_at", from_date);
  }

  if (to_date) {
    query = query.lte("created_at", to_date);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[getTransactions]", error);
    return { data: null, error: error.message, count: 0 };
  }

  return {
    data,
    error: null,
    count: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

// ── Dashboard ──────────────────────────────────────────────

/**
 * Returns all the numbers needed to power the dashboard:
 * - Order counts by status
 * - Revenue (today, this week, this month, all time)
 * - Low stock products
 * - Recent orders
 * - Recent transactions
 *
 * All queries run in parallel for speed.
 */
export async function getDashboardSummary() {
  const supabase = await createServerClient();

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay(),
  ).toISOString();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const [
    orderCountsResult,
    revenueAllTimeResult,
    revenueTodayResult,
    revenueWeekResult,
    revenueMonthResult,
    lowStockResult,
    recentOrdersResult,
    recentTransactionsResult,
    customerCountResult,
  ] = await Promise.all([
    // Order counts per status
    supabase.from("orders").select("status", { count: "exact" }),

    // All-time revenue (completed orders only)
    supabase
      .from("transactions")
      .select("amount")
      .eq("status", "completed")
      .eq("type", "sale"),

    // Revenue today
    supabase
      .from("transactions")
      .select("amount")
      .eq("status", "completed")
      .eq("type", "sale")
      .gte("created_at", startOfToday),

    // Revenue this week
    supabase
      .from("transactions")
      .select("amount")
      .eq("status", "completed")
      .eq("type", "sale")
      .gte("created_at", startOfWeek),

    // Revenue this month
    supabase
      .from("transactions")
      .select("amount")
      .eq("status", "completed")
      .eq("type", "sale")
      .gte("created_at", startOfMonth),

    // Low stock products (stock at or below low_stock_alert)
    supabase
      .from("products")
      .select("id, name, stock, low_stock_alert, sku")
      .neq("status", "archived")
      .eq("track_inventory", true)
      .lte("stock", 10)
      .order("stock", { ascending: true })
      .limit(10),

    // Recent orders with customer info
    supabase
      .from("orders")
      .select(
        `
        id, order_number, status, payment_status, total, created_at,
        customers(id, name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(5),

    // Recent transactions
    supabase
      .from("transactions")
      .select(
        `
        id, amount, type, status, payment_method, created_at,
        orders(order_number, customers(name))
      `,
      )
      .order("created_at", { ascending: false })
      .limit(5),

    // Total customer count
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  // ── Calculate revenue totals ───────────────────────────────
  const sumAmounts = (rows: { amount: number }[] | null) =>
    (rows ?? []).reduce((sum, row) => sum + Number(row.amount), 0);

  const revenue = {
    today: sumAmounts(revenueTodayResult.data),
    week: sumAmounts(revenueWeekResult.data),
    month: sumAmounts(revenueMonthResult.data),
    all_time: sumAmounts(revenueAllTimeResult.data),
  };

  // ── Calculate order counts per status ─────────────────────
  const allOrders = orderCountsResult.data ?? [];
  const orderCounts = {
    total: allOrders.length,
    pending: allOrders.filter((o) => o.status === "pending").length,
    processing: allOrders.filter((o) => o.status === "processing").length,
    completed: allOrders.filter((o) => o.status === "completed").length,
    cancelled: allOrders.filter((o) => o.status === "cancelled").length,
  };

  return {
    error: null,
    data: {
      revenue,
      orderCounts,
      activeCustomers: customerCountResult.count ?? 0,
      lowStockProducts: lowStockResult.data ?? [],
      recentOrders: recentOrdersResult.data ?? [],
      recentTransactions: recentTransactionsResult.data ?? [],
    },
  };
}

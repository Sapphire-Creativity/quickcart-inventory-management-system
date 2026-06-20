"use server";

import { auth } from "@clerk/nextjs/server";
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

// ── Actions ────────────────────────────────────────────────

export async function getTransactions(options: GetTransactionsOptions = {}) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized", count: 0 };

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
    .eq("user_id", userId)                      // ← tenant filter
    .order("created_at", { ascending: false })
    .range(from, to);

  if (order_id) query = query.eq("order_id", order_id);
  if (type) query = query.eq("type", type);
  if (status) query = query.eq("status", status);
  if (from_date) query = query.gte("created_at", from_date);
  if (to_date) query = query.lte("created_at", to_date);

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

export async function getDashboardSummary() {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(), now.getMonth(), now.getDate(),
  ).toISOString();
  const startOfWeek = new Date(
    now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(),
  ).toISOString();
  const startOfMonth = new Date(
    now.getFullYear(), now.getMonth(), 1,
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
    supabase
      .from("orders")
      .select("status", { count: "exact" })
      .eq("user_id", userId),                   // ← tenant filter

    // All-time revenue
    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)                    // ← tenant filter
      .eq("status", "completed")
      .eq("type", "sale"),

    // Revenue today
    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)                    // ← tenant filter
      .eq("status", "completed")
      .eq("type", "sale")
      .gte("created_at", startOfToday),

    // Revenue this week
    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)                    // ← tenant filter
      .eq("status", "completed")
      .eq("type", "sale")
      .gte("created_at", startOfWeek),

    // Revenue this month
    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)                    // ← tenant filter
      .eq("status", "completed")
      .eq("type", "sale")
      .gte("created_at", startOfMonth),

    // Low stock products
    supabase
      .from("products")
      .select("id, name, stock, low_stock_alert, sku")
      .eq("user_id", userId)                    // ← tenant filter
      .neq("status", "archived")
      .eq("track_inventory", true)
      .lte("stock", 10)
      .order("stock", { ascending: true })
      .limit(10),

    // Recent orders
    supabase
      .from("orders")
      .select(`id, order_number, status, payment_status, total, created_at, customers(id, name)`)
      .eq("user_id", userId)                    // ← tenant filter
      .order("created_at", { ascending: false })
      .limit(5),

    // Recent transactions
    supabase
      .from("transactions")
      .select(`id, amount, type, status, payment_method, created_at, orders(order_number, customers(name))`)
      .eq("user_id", userId)                    // ← tenant filter
      .order("created_at", { ascending: false })
      .limit(5),

    // Active customer count
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)                    // ← tenant filter
      .eq("status", "active"),
  ]);

  const sumAmounts = (rows: { amount: number }[] | null) =>
    (rows ?? []).reduce((sum, row) => sum + Number(row.amount), 0);

  const revenue = {
    today: sumAmounts(revenueTodayResult.data),
    week: sumAmounts(revenueWeekResult.data),
    month: sumAmounts(revenueMonthResult.data),
    all_time: sumAmounts(revenueAllTimeResult.data),
  };

  const allOrders = orderCountsResult.data ?? [];
  const orderCounts = {
    total: allOrders.length,
    pending:    allOrders.filter((o) => o.status === "pending").length,
    processing: allOrders.filter((o) => o.status === "processing").length,
    completed:  allOrders.filter((o) => o.status === "completed").length,
    cancelled:  allOrders.filter((o) => o.status === "cancelled").length,
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
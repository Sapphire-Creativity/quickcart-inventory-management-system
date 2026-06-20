"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────

export interface DailyRevenue {
  day: string;
  date: string;
  value: number;
}

export interface WeeklyRevenueData {
  thisWeek: DailyRevenue[];
  lastWeek: DailyRevenue[];
  thisWeekTotal: number;
  lastWeekTotal: number;
  weekOverWeekChange: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  unitsSold: number;
  revenue: number;
  imageUrl: string | null;
}

export interface DashboardStats {
  revenue: {
    thisWeek: number;
    lastWeek: number;
    thisMonth: number;
    allTime: number;
    weekOverWeekChange: number;
  };
  orders: {
    thisWeek: number;
    lastWeek: number;
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    weekOverWeekChange: number;
  };
  customers: {
    active: number;
  };
}

// ── Helpers ────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

// ── Actions ────────────────────────────────────────────────

export async function getDashboardStats(): Promise<{
  data: DashboardStats | null;
  error: string | null;
}> {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const now = new Date();
  const todayStart = startOfDay(now);
  const thisWeekStart = addDays(todayStart, -6);
  const lastWeekStart = addDays(todayStart, -13);
  const lastWeekEnd = addDays(todayStart, -7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    thisWeekTxResult,
    lastWeekTxResult,
    monthTxResult,
    allTimeTxResult,
    thisWeekOrdersResult,
    lastWeekOrdersResult,
    allOrdersResult,
    activeCustomersResult,
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "sale")
      .eq("status", "completed")
      .gte("created_at", thisWeekStart.toISOString()),

    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "sale")
      .eq("status", "completed")
      .gte("created_at", lastWeekStart.toISOString())
      .lt("created_at", lastWeekEnd.toISOString()),

    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "sale")
      .eq("status", "completed")
      .gte("created_at", monthStart.toISOString()),

    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "sale")
      .eq("status", "completed"),

    supabase
      .from("orders")
      .select("status")
      .eq("user_id", userId)
      .gte("created_at", thisWeekStart.toISOString()),

    supabase
      .from("orders")
      .select("status")
      .eq("user_id", userId)
      .gte("created_at", lastWeekStart.toISOString())
      .lt("created_at", lastWeekEnd.toISOString()),

    supabase.from("orders").select("status").eq("user_id", userId),

    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  if (thisWeekTxResult.error)
    return { data: null, error: thisWeekTxResult.error.message };

  const sum = (rows: { amount: number }[] | null) =>
    (rows ?? []).reduce((s, r) => s + Number(r.amount), 0);

  const thisWeekRevenue = sum(thisWeekTxResult.data);
  const lastWeekRevenue = sum(lastWeekTxResult.data);
  const thisWeekOrderCount = thisWeekOrdersResult.data?.length ?? 0;
  const lastWeekOrderCount = lastWeekOrdersResult.data?.length ?? 0;
  const allOrders = allOrdersResult.data ?? [];

  return {
    data: {
      revenue: {
        thisWeek: thisWeekRevenue,
        lastWeek: lastWeekRevenue,
        thisMonth: sum(monthTxResult.data),
        allTime: sum(allTimeTxResult.data),
        weekOverWeekChange: pctChange(thisWeekRevenue, lastWeekRevenue),
      },
      orders: {
        thisWeek: thisWeekOrderCount,
        lastWeek: lastWeekOrderCount,
        total: allOrders.length,
        pending: allOrders.filter((o) => o.status === "pending").length,
        processing: allOrders.filter((o) => o.status === "processing").length,
        completed: allOrders.filter((o) => o.status === "completed").length,
        cancelled: allOrders.filter((o) => o.status === "cancelled").length,
        weekOverWeekChange: pctChange(thisWeekOrderCount, lastWeekOrderCount),
      },
      customers: {
        active: activeCustomersResult.count ?? 0,
      },
    },
    error: null,
  };
}

export async function getWeeklyRevenue(): Promise<{
  data: WeeklyRevenueData | null;
  error: string | null;
}> {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const now = new Date();
  const todayStart = startOfDay(now);
  const thisWeekStart = addDays(todayStart, -6);
  const lastWeekStart = addDays(todayStart, -13);

  const [thisWeekResult, lastWeekResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount, created_at")
      .eq("user_id", userId)
      .eq("type", "sale")
      .eq("status", "completed")
      .gte("created_at", thisWeekStart.toISOString())
      .lte("created_at", addDays(todayStart, 1).toISOString()),

    supabase
      .from("transactions")
      .select("amount, created_at")
      .eq("user_id", userId)
      .eq("type", "sale")
      .eq("status", "completed")
      .gte("created_at", lastWeekStart.toISOString())
      .lt("created_at", thisWeekStart.toISOString()),
  ]);

  if (thisWeekResult.error)
    return { data: null, error: thisWeekResult.error.message };

  const buildDailyMap = (rows: { amount: number; created_at: string }[]) => {
    const map: Record<string, number> = {};
    for (const row of rows) {
      const date = row.created_at.slice(0, 10);
      map[date] = (map[date] ?? 0) + Number(row.amount);
    }
    return map;
  };

  const thisWeekMap = buildDailyMap(thisWeekResult.data ?? []);
  const lastWeekMap = buildDailyMap(lastWeekResult.data ?? []);

  const thisWeek: DailyRevenue[] = [];
  const lastWeek: DailyRevenue[] = [];

  for (let i = 6; i >= 0; i--) {
    const thisDate = addDays(todayStart, -i);
    const lastDate = addDays(todayStart, -i - 7);
    const thisISO = thisDate.toISOString().slice(0, 10);
    const lastISO = lastDate.toISOString().slice(0, 10);
    const dayLabel = DAY_LABELS[thisDate.getDay()];

    thisWeek.push({
      day: dayLabel,
      date: thisISO,
      value: thisWeekMap[thisISO] ?? 0,
    });
    lastWeek.push({
      day: dayLabel,
      date: lastISO,
      value: lastWeekMap[lastISO] ?? 0,
    });
  }

  const thisWeekTotal = thisWeek.reduce((s, d) => s + d.value, 0);
  const lastWeekTotal = lastWeek.reduce((s, d) => s + d.value, 0);

  return {
    data: {
      thisWeek,
      lastWeek,
      thisWeekTotal,
      lastWeekTotal,
      weekOverWeekChange: pctChange(thisWeekTotal, lastWeekTotal),
    },
    error: null,
  };
}

export async function getTopProducts(
  limit = 5,
): Promise<{ data: TopProduct[] | null; error: string | null }> {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      product_id,
      product_name,
      quantity,
      unit_price,
      orders!inner(status),
      products(id, sku, price, product_images(url, is_featured))
    `,
    )
    .eq("user_id", userId) // ← tenant filter
    .eq("orders.status", "completed");

  if (error) {
    console.error("[getTopProducts]", error);
    return { data: null, error: error.message };
  }

  const map: Record<
    string,
    {
      id: string;
      name: string;
      sku: string | null;
      price: number;
      unitsSold: number;
      revenue: number;
      imageUrl: string | null;
    }
  > = {};

  for (const item of data ?? []) {
    const pid = item.product_id;
    if (!pid) continue;  

    const product = item.products as any;
    const images = product?.product_images ?? [];
    const featuredImg =
      images.find((i: any) => i.is_featured)?.url ?? images[0]?.url ?? null;

    if (!map[pid]) {
      map[pid] = {
        id: pid,
        name: item.product_name,
        sku: product?.sku ?? null,
        price: product?.price ?? item.unit_price,
        unitsSold: 0,
        revenue: 0,
        imageUrl: featuredImg,
      };
    }
    map[pid].unitsSold += item.quantity;
    map[pid].revenue += item.unit_price * item.quantity;
  }
  const sorted = Object.values(map)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit);

  return { data: sorted, error: null };
}

export async function getRecentTransactions() {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      id, amount, type, status, payment_method, created_at,
      orders(order_number, customer_id,
        customers(id, name, email)
      )
    `,
    )
    .eq("user_id", userId) // ← tenant filter
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("[getRecentTransactions]", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

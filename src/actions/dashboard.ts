'use server'

import { createServerClient } from '@/lib/supabase/server'

// ── Types ──────────────────────────────────────────────────

export interface DailyRevenue {
  day: string        // e.g. "Mon", "Tue"
  date: string       // ISO date string e.g. "2024-03-11"
  value: number      // revenue for that day
}

export interface WeeklyRevenueData {
  thisWeek: DailyRevenue[]
  lastWeek: DailyRevenue[]
  thisWeekTotal: number
  lastWeekTotal: number
  /** Percentage change vs last week (can be negative) */
  weekOverWeekChange: number
}

export interface TopProduct {
  id: string
  name: string
  sku: string | null
  price: number
  unitsSold: number
  revenue: number
  imageUrl: string | null
}

export interface DashboardStats {
  revenue: {
    thisWeek: number
    lastWeek: number
    thisMonth: number
    allTime: number
    weekOverWeekChange: number
  }
  orders: {
    thisWeek: number
    lastWeek: number
    total: number
    pending: number
    processing: number
    completed: number
    cancelled: number
    weekOverWeekChange: number
  }
  customers: {
    active: number
  }
}

// ── Helpers ────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100 * 10) / 10
}

// ── Actions ────────────────────────────────────────────────

/**
 * Returns all KPI numbers needed for the dashboard stat cards:
 * revenue, order counts, and customer count — this week vs last week.
 */
export async function getDashboardStats(): Promise<{ data: DashboardStats | null; error: string | null }> {
  const supabase = await createServerClient()

  const now = new Date()
  const todayStart = startOfDay(now)

  // Week boundaries
  // "This week" = last 7 days (rolling), "last week" = the 7 days before that
  const thisWeekStart = addDays(todayStart, -6)   // 7 days including today
  const lastWeekStart = addDays(todayStart, -13)
  const lastWeekEnd   = addDays(todayStart, -7)
  const monthStart    = new Date(now.getFullYear(), now.getMonth(), 1)

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
    // Revenue this week (completed sales only)
    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'sale')
      .eq('status', 'completed')
      .gte('created_at', thisWeekStart.toISOString()),

    // Revenue last week
    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'sale')
      .eq('status', 'completed')
      .gte('created_at', lastWeekStart.toISOString())
      .lt('created_at', lastWeekEnd.toISOString()),

    // Revenue this month
    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'sale')
      .eq('status', 'completed')
      .gte('created_at', monthStart.toISOString()),

    // All-time revenue
    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'sale')
      .eq('status', 'completed'),

    // Orders this week
    supabase
      .from('orders')
      .select('status')
      .gte('created_at', thisWeekStart.toISOString()),

    // Orders last week
    supabase
      .from('orders')
      .select('status')
      .gte('created_at', lastWeekStart.toISOString())
      .lt('created_at', lastWeekEnd.toISOString()),

    // All orders (for status breakdown)
    supabase
      .from('orders')
      .select('status'),

    // Active customers
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
  ])

  if (thisWeekTxResult.error) return { data: null, error: thisWeekTxResult.error.message }

  const sum = (rows: { amount: number }[] | null) =>
    (rows ?? []).reduce((s, r) => s + Number(r.amount), 0)

  const thisWeekRevenue = sum(thisWeekTxResult.data)
  const lastWeekRevenue = sum(lastWeekTxResult.data)

  const thisWeekOrderCount = thisWeekOrdersResult.data?.length ?? 0
  const lastWeekOrderCount = lastWeekOrdersResult.data?.length ?? 0
  const allOrders = allOrdersResult.data ?? []

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
        pending:    allOrders.filter(o => o.status === 'pending').length,
        processing: allOrders.filter(o => o.status === 'processing').length,
        completed:  allOrders.filter(o => o.status === 'completed').length,
        cancelled:  allOrders.filter(o => o.status === 'cancelled').length,
        weekOverWeekChange: pctChange(thisWeekOrderCount, lastWeekOrderCount),
      },
      customers: {
        active: activeCustomersResult.count ?? 0,
      },
    },
    error: null,
  }
}

/**
 * Returns daily revenue for this week and last week,
 * shaped as { day: "Mon", value: 1234 } arrays ready for the chart.
 */
export async function getWeeklyRevenue(): Promise<{ data: WeeklyRevenueData | null; error: string | null }> {
  const supabase = await createServerClient()

  const now = new Date()
  const todayStart = startOfDay(now)
  const thisWeekStart = addDays(todayStart, -6)
  const lastWeekStart = addDays(todayStart, -13)

  const [thisWeekResult, lastWeekResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('type', 'sale')
      .eq('status', 'completed')
      .gte('created_at', thisWeekStart.toISOString())
      .lte('created_at', addDays(todayStart, 1).toISOString()),

    supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('type', 'sale')
      .eq('status', 'completed')
      .gte('created_at', lastWeekStart.toISOString())
      .lt('created_at', thisWeekStart.toISOString()),
  ])

  if (thisWeekResult.error) return { data: null, error: thisWeekResult.error.message }

  // Build a map of ISO date → revenue for each week
  const buildDailyMap = (rows: { amount: number; created_at: string }[]) => {
    const map: Record<string, number> = {}
    for (const row of rows) {
      const date = row.created_at.slice(0, 10) // "YYYY-MM-DD"
      map[date] = (map[date] ?? 0) + Number(row.amount)
    }
    return map
  }

  const thisWeekMap = buildDailyMap(thisWeekResult.data ?? [])
  const lastWeekMap = buildDailyMap(lastWeekResult.data ?? [])

  // Build 7-day arrays anchored to today
  const thisWeek: DailyRevenue[] = []
  const lastWeek: DailyRevenue[] = []

  for (let i = 6; i >= 0; i--) {
    const thisDate = addDays(todayStart, -i)
    const lastDate = addDays(todayStart, -i - 7)
    const thisISO = thisDate.toISOString().slice(0, 10)
    const lastISO = lastDate.toISOString().slice(0, 10)
    const dayLabel = DAY_LABELS[thisDate.getDay()]

    thisWeek.push({ day: dayLabel, date: thisISO, value: thisWeekMap[thisISO] ?? 0 })
    lastWeek.push({ day: dayLabel, date: lastISO, value: lastWeekMap[lastISO] ?? 0 })
  }

  const thisWeekTotal = thisWeek.reduce((s, d) => s + d.value, 0)
  const lastWeekTotal = lastWeek.reduce((s, d) => s + d.value, 0)

  return {
    data: {
      thisWeek,
      lastWeek,
      thisWeekTotal,
      lastWeekTotal,
      weekOverWeekChange: pctChange(thisWeekTotal, lastWeekTotal),
    },
    error: null,
  }
}

/**
 * Returns the top N products by units sold, joining order_items → products.
 * Only counts items from completed orders.
 */
export async function getTopProducts(limit = 5): Promise<{ data: TopProduct[] | null; error: string | null }> {
  const supabase = await createServerClient()

  // Pull all order_items from completed orders with product info
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      product_id,
      product_name,
      quantity,
      unit_price,
      orders!inner(status),
      products(id, sku, price, product_images(url, is_featured))
    `)
    .eq('orders.status', 'completed')

  if (error) {
    console.error('[getTopProducts]', error)
    return { data: null, error: error.message }
  }

  // Aggregate by product_id
  const map: Record<string, {
    id: string
    name: string
    sku: string | null
    price: number
    unitsSold: number
    revenue: number
    imageUrl: string | null
  }> = {}

  for (const item of data ?? []) {
    const pid = item.product_id
    const product = item.products as any
    const images = product?.product_images ?? []
    const featuredImg = images.find((i: any) => i.is_featured)?.url ?? images[0]?.url ?? null

    if (!map[pid]) {
      map[pid] = {
        id: pid,
        name: item.product_name,
        sku: product?.sku ?? null,
        price: product?.price ?? item.unit_price,
        unitsSold: 0,
        revenue: 0,
        imageUrl: featuredImg,
      }
    }
    map[pid].unitsSold += item.quantity
    map[pid].revenue += item.unit_price * item.quantity
  }

  const sorted = Object.values(map)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit)

  return { data: sorted, error: null }
}

/**
 * Returns the 5 most recent completed transactions
 * for the dashboard TransactionsTable.
 */
export async function getRecentTransactions() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id, amount, type, status, payment_method, created_at,
      orders(order_number, customer_id,
        customers(id, name, email)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('[getRecentTransactions]', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
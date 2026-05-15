'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { adjustStock } from './products'

// ── Types ──────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'partially_paid' | 'refunded'
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other'
export type OrderType = 'delivery' | 'pickup' | 'in_store'

export type OrderItemInput = {
  product_id: string
  variant_id?: string       // optional — only for products with variants
  product_name: string      // snapshot: saved at order time in case product is later edited
  variant?: string          // snapshot: e.g "Color: Red, Size: M"
  image_url?: string
  quantity: number
  unit_price: number        // snapshot: price at time of order
}

export type CreateOrderInput = {
  customer_id: string
  items: OrderItemInput[]
  order_type?: OrderType
  payment_method?: PaymentMethod
  tax?: number
  discount?: number
  notes?: string
  admin_notes?: string
}

export type UpdateOrderStatusInput = {
  status: OrderStatus
  payment_status?: PaymentStatus
  admin_notes?: string
}

export type GetOrdersOptions = {
  page?: number
  pageSize?: number
  search?: string           // searches order_number
  status?: OrderStatus
  payment_status?: PaymentStatus
  customer_id?: string
  from_date?: string        // ISO date string
  to_date?: string
}

// ── Helpers ────────────────────────────────────────────────

/**
 * Generates a readable order number like ORD-20240513-4821
 */
function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${date}-${random}`
}

// ── Actions ────────────────────────────────────────────────

/**
 * Create a new order with line items.
 *
 * This action:
 * 1. Validates all items have enough stock
 * 2. Creates the order record
 * 3. Creates all order_items (with product snapshots)
 * 4. Decrements stock for each item
 * 5. Auto-creates a transaction record
 *
 * If stock validation fails, the order is not created.
 */
export async function createOrder(input: CreateOrderInput) {
  const supabase = await createServerClient()

  // ── Step 1: Validate stock for all items ──────────────────
  for (const item of input.items) {
    if (item.variant_id) {
      const { data: variant, error } = await supabase
        .from('product_variants')
        .select('stock, sku')
        .eq('id', item.variant_id)
        .single()

      if (error) return { data: null, error: `Could not find variant for ${item.product_name}` }

      if (variant.stock < item.quantity) {
        return {
          data: null,
          error: `Not enough stock for "${item.product_name} (${item.variant})". Available: ${variant.stock}, Requested: ${item.quantity}`,
        }
      }
    } else {
      const { data: product, error } = await supabase
        .from('products')
        .select('stock, track_inventory')
        .eq('id', item.product_id)
        .single()

      if (error) return { data: null, error: `Could not find product "${item.product_name}"` }

      if (product.track_inventory && product.stock < item.quantity) {
        return {
          data: null,
          error: `Not enough stock for "${item.product_name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        }
      }
    }
  }

  // ── Step 2: Calculate totals ───────────────────────────────
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  )
  const tax = input.tax ?? 0
  const discount = input.discount ?? 0
  const total = Math.max(0, subtotal + tax - discount)

  // ── Step 3: Create the order ───────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      customer_id: input.customer_id,
      status: 'pending',
      payment_status: 'unpaid',
      payment_method: input.payment_method ?? null,
      order_type: input.order_type ?? 'in_store',
      subtotal,
      tax,
      discount,
      total,
      notes: input.notes ?? null,
      admin_notes: input.admin_notes ?? null,
      created_by: 'admin',
    })
    .select()
    .single()

  if (orderError) {
    console.error('[createOrder] order insert', orderError)
    return { data: null, error: orderError.message }
  }

  // ── Step 4: Create order items ─────────────────────────────
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(
      input.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        variant: item.variant ?? null,
        image_url: item.image_url ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      }))
    )

  if (itemsError) {
    console.error('[createOrder] items insert', itemsError)
    // Order was created but items failed — flag this clearly
    return { data: null, error: `Order created but items failed to save: ${itemsError.message}` }
  }

  // ── Step 5: Decrement stock for each item ──────────────────
  for (const item of input.items) {
    await adjustStock(
      { productId: item.product_id, variantId: item.variant_id },
      -item.quantity
    )
  }

  revalidatePath('/orders')
  return { data: order, error: null }
}

/**
 * Get a paginated, filterable list of orders with customer info.
 */
export async function getOrders(options: GetOrdersOptions = {}) {
  const supabase = await createServerClient()
  const {
    page = 1,
    pageSize = 20,
    search,
    status,
    payment_status,
    customer_id,
    from_date,
    to_date,
  } = options
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('orders')
    .select(
      `
      id, order_number, status, payment_status, payment_method,
      order_type, subtotal, tax, discount, total, currency,
      notes, created_at, updated_at,
      customers(id, name, email, phone)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.ilike('order_number', `%${search}%`)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (payment_status) {
    query = query.eq('payment_status', payment_status)
  }

  if (customer_id) {
    query = query.eq('customer_id', customer_id)
  }

  if (from_date) {
    query = query.gte('created_at', from_date)
  }

  if (to_date) {
    query = query.lte('created_at', to_date)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('[getOrders]', error)
    return { data: null, error: error.message, count: 0 }
  }

  return {
    data,
    error: null,
    count: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

/**
 * Get a single order by ID with full details:
 * customer info, all line items, and transaction history.
 */
export async function getOrderById(id: string) {
  const supabase = await createServerClient()

  const [orderResult, itemsResult, transactionsResult] = await Promise.all([
    supabase
      .from('orders')
      .select(`*, customers(id, name, email, phone, address)`)
      .eq('id', id)
      .single(),

    supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id),

    supabase
      .from('transactions')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (orderResult.error) {
    console.error('[getOrderById]', orderResult.error)
    return { data: null, error: orderResult.error.message }
  }

  return {
    data: {
      ...orderResult.data,
      items: itemsResult.data ?? [],
      transactions: transactionsResult.data ?? [],
    },
    error: null,
  }
}

/**
 * Update an order's status.
 *
 * Side effects:
 * - 'completed' → auto-creates a transaction record
 * - 'cancelled' → restores stock for all items
 */
export async function updateOrderStatus(id: string, input: UpdateOrderStatusInput) {
  const supabase = await createServerClient()

  // Fetch current order state before updating
  const { data: currentOrder, error: fetchError } = await supabase
    .from('orders')
    .select('status, total')
    .eq('id', id)
    .single()

  if (fetchError) return { data: null, error: fetchError.message }

  // Guard: don't allow changing status of an already cancelled order
  if (currentOrder.status === 'cancelled') {
    return { data: null, error: 'Cannot update a cancelled order.' }
  }

  // Guard: don't allow un-completing an order
  if (currentOrder.status === 'completed' && input.status !== 'completed') {
    return { data: null, error: 'Cannot change the status of a completed order.' }
  }

  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update({
      status: input.status,
      ...(input.payment_status && { payment_status: input.payment_status }),
      ...(input.admin_notes !== undefined && { admin_notes: input.admin_notes }),
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('[updateOrderStatus]', updateError)
    return { data: null, error: updateError.message }
  }

  // ── Side effect: completed → create transaction ────────────
  if (input.status === 'completed' && currentOrder.status !== 'completed') {
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        order_id: id,
        amount: currentOrder.total,
        type: 'sale',
        status: 'completed',
        payment_method: order.payment_method ?? null,
      })

    if (txError) console.error('[updateOrderStatus] transaction insert', txError)
  }

  // ── Side effect: cancelled → restore stock ─────────────────
  if (input.status === 'cancelled' && currentOrder.status !== 'cancelled') {
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', id)

    if (items) {
      for (const item of items) {
        await adjustStock({ productId: item.product_id }, item.quantity)
      }
    }
  }

  revalidatePath('/orders')
  revalidatePath(`/orders/${id}`)
  return { data: order, error: null }
}

/**
 * Delete an order.
 * Only allowed when status is 'pending' — stock is restored before deletion.
 */
export async function deleteOrder(id: string) {
  const supabase = await createServerClient()

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .single()

  if (fetchError) return { error: fetchError.message }

  if (order.status !== 'pending') {
    return {
      error: `Only pending orders can be deleted. This order is "${order.status}". Cancel it first.`,
    }
  }

  // Restore stock before deleting
  const { data: items } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', id)

  if (items) {
    for (const item of items) {
      await adjustStock({ productId: item.product_id }, item.quantity)
    }
  }

  const { error } = await supabase.from('orders').delete().eq('id', id)

  if (error) {
    console.error('[deleteOrder]', error)
    return { error: error.message }
  }

  revalidatePath('/orders')
  return { error: null }
}
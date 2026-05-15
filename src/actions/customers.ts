'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Types ──────────────────────────────────────────────────

export type CustomerAddress = {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export type CustomerStatus = 'active' | 'inactive' | 'banned'

export type CreateCustomerInput = {
  name: string
  email?: string
  phone: string
  address?: CustomerAddress
  status?: CustomerStatus
  notes?: string
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>

export type GetCustomersOptions = {
  page?: number
  pageSize?: number
  search?: string
  status?: CustomerStatus
}

// ── Actions ────────────────────────────────────────────────

/**
 * Create a new customer.
 */
export async function createCustomer(input: CreateCustomerInput) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('customers')
    .insert({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone,
      address: input.address ?? null,
      status: input.status ?? 'active',
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[createCustomer]', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/customers')
  return { data, error: null }
}

/**
 * Get a paginated, searchable list of customers.
 * Uses the customer_metrics view so order stats come back in the same query.
 */
export async function getCustomers(options: GetCustomersOptions = {}) {
  const supabase = await createServerClient()
  const { page = 1, pageSize = 20, search, status } = options
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('customer_metrics')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    )
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('[getCustomers]', error)
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
 * Get a single customer by ID, including their order history.
 */
export async function getCustomerById(id: string) {
  const supabase = await createServerClient()

  const [customerResult, ordersResult] = await Promise.all([
    supabase
      .from('customer_metrics')
      .select('*')
      .eq('id', id)
      .single(),

    supabase
      .from('orders')
      .select('id, order_number, status, payment_status, total, created_at')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (customerResult.error) {
    console.error('[getCustomerById]', customerResult.error)
    return { data: null, error: customerResult.error.message }
  }

  return {
    data: {
      ...customerResult.data,
      recent_orders: ordersResult.data ?? [],
    },
    error: null,
  }
}

/**
 * Update an existing customer.
 */
export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('customers')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.notes !== undefined && { notes: input.notes }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[updateCustomer]', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  return { data, error: null }
}

/**
 * Delete a customer.
 * Blocked if the customer has any orders that are not cancelled —
 * those orders would lose their customer reference.
 */
export async function deleteCustomer(id: string) {
  const supabase = await createServerClient()

  // Guard: check for active orders
  const { count, error: checkError } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', id)
    .neq('status', 'cancelled')

  if (checkError) {
    console.error('[deleteCustomer] check', checkError)
    return { error: checkError.message }
  }

  if (count && count > 0) {
    return {
      error: `Cannot delete: this customer has ${count} active order${count > 1 ? 's' : ''}. Cancel the orders first.`,
    }
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteCustomer]', error)
    return { error: error.message }
  }

  revalidatePath('/customers')
  return { error: null }
}
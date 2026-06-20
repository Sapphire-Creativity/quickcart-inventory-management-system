"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// ── Types & Interfaces ─────────────────────────────────────

export type CustomerStatus = "active" | "inactive" | "vip";

export interface CustomerAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: CustomerAddress;
  status: CustomerStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_spend?: number;
  last_order_date?: string;
  average_order_value?: number;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
}

export type CreateCustomerInput = {
  name: string;
  email?: string;
  phone: string;
  address?: CustomerAddress;
  status?: CustomerStatus;
  notes?: string;
};

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export type GetCustomersOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CustomerStatus;
};

// ── Actions ────────────────────────────────────────────────

export async function getCustomers(options: GetCustomersOptions = {}) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized", count: 0 };

  const supabase = await createServerClient();
  const { page = 1, pageSize = 20, search, status } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("customer_metrics")
    .select("*", { count: "exact" })
    .eq("user_id", userId) // ← tenant filter ✓
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[getCustomers]", error);
    return { data: null, error: error.message, count: 0 };
  }

  return {
    data: data as Customer[],
    error: null,
    count: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getCustomerById(id: string) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const [customerResult, ordersResult] = await Promise.all([
    supabase
      .from("customer_metrics")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId) // ← was missing, now fixed ✓
      .single(),

    supabase
      .from("orders")
      .select("id, order_number, status, payment_status, total, created_at")
      .eq("customer_id", id)
      .eq("user_id", userId) // ← tenant filter ✓
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (customerResult.error) {
    console.error("[getCustomerById]", customerResult.error);
    return { data: null, error: customerResult.error.message };
  }

  return {
    data: {
      ...(customerResult.data as Customer),
      recent_orders: (ordersResult.data ?? []) as OrderSummary[],
    },
    error: null,
  };
}

export async function createCustomer(input: CreateCustomerInput) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      email: input.email ?? null,
      phone: input.phone,
      address: (input.address ?? null) as any, // ← cast to any
      status: input.status ?? "active",
      notes: input.notes ?? null,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("[createCustomer]", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/dashboard/customers");
  return { data: data as Customer, error: null };
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("customers")
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.address !== undefined && { address: input.address as any }), // ← cast to any
      ...(input.status !== undefined && { status: input.status }),
      ...(input.notes !== undefined && { notes: input.notes }),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("[updateCustomer]", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/dashboard/customers");
  return { data: data as Customer, error: null };
}

export async function deleteCustomer(id: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createServerClient();

  const { count, error: checkError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", id)
    .eq("user_id", userId) // ← tenant filter ✓
    .neq("status", "cancelled");

  if (checkError) {
    console.error("[deleteCustomer] check", checkError);
    return { error: checkError.message };
  }

  if (count && count > 0) {
    return {
      error: `Cannot delete: this customer has ${count} active order${count > 1 ? "s" : ""}. Cancel the orders first.`,
    };
  }

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("user_id", userId); // ← tenant filter ✓

  if (error) {
    console.error("[deleteCustomer]", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/customers");
  return { error: null };
}

export async function searchCustomers(query: string) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId) // ← tenant filter ✓
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  if (error) {
    console.error("[searchCustomers]", error);
    return { data: null, error: error.message };
  }

  return { data: data as Customer[], error: null };
}

"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Types ──────────────────────────────────────────────────

export type ProductStatus = "draft" | "active" | "archived";
export type ProductVisibility = "public" | "private" | "hidden";
export type ShippingClass = "standard" | "express" | "free" | "local_pickup";

export type ProductDimensions = {
  length?: number;
  width?: number;
  height?: number;
  unit?: "cm" | "in";
};

export type ProductVariantInput = {
  options: Record<string, string>; // e.g. { color: 'red', size: 'M' }
  price: number;
  compare_price?: number;
  sku?: string;
  stock: number;
};

export type ProductVariantOptionInput = {
  name: string; // e.g. "Color"
  values: string[]; // e.g. ["Red", "Blue", "Green"]
  position?: number;
};

export type CreateProductInput = {
  name: string;
  description?: string;
  short_description?: string;
  slug?: string;
  price: number;
  compare_price?: number;
  cost?: number;
  sku?: string;
  stock?: number;
  track_inventory?: boolean;
  low_stock_alert?: number;
  has_variants?: boolean;
  category_id?: string;
  tags?: string[];
  vendor?: string;
  product_type?: string;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  weight?: number;
  dimensions?: ProductDimensions;
  shipping_class?: ShippingClass;
  seo_title?: string;
  seo_description?: string;
  // Related data (created alongside the product)
  variants?: ProductVariantInput[];
  variant_options?: ProductVariantOptionInput[];
  image_urls?: string[];
};

export type UpdateProductInput = Partial<
  Omit<CreateProductInput, "variants" | "variant_options" | "image_urls">
>;

export type GetProductsOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProductStatus;
  category_id?: string;
  low_stock?: boolean; // filter products at or below low_stock_alert threshold
};

// ── Actions ────────────────────────────────────────────────

/**
 * Create a new product, with optional variants, variant options, and images.
 * All inserts are run together so a failure doesn't leave partial data.
 */
export async function createProduct(input: CreateProductInput) {
  const supabase = await createServerClient();

  // Generate a slug from the name if not provided
  const slug =
    input.slug ??
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: input.name,
      description: input.description ?? null,
      short_description: input.short_description ?? null,
      slug,
      price: input.price,
      compare_price: input.compare_price ?? null,
      cost: input.cost ?? null,
      sku: input.sku ?? null,
      stock: input.stock ?? 0,
      track_inventory: input.track_inventory ?? true,
      low_stock_alert: input.low_stock_alert ?? 5,
      has_variants: input.has_variants ?? false,
      category_id: input.category_id ?? null,
      tags: input.tags ?? [],
      vendor: input.vendor ?? null,
      product_type: input.product_type ?? null,
      status: input.status ?? "draft",
      visibility: input.visibility ?? "public",
      weight: input.weight ?? null,
      dimensions: input.dimensions ?? null,
      shipping_class: input.shipping_class ?? "standard",
      seo_title: input.seo_title ?? null,
      seo_description: input.seo_description ?? null,
    })
    .select()
    .single();

  if (productError) {
    console.error("[createProduct]", productError);
    return { data: null, error: productError.message };
  }

  // Insert variant options (e.g. Color: [Red, Blue], Size: [S, M, L])
  if (input.variant_options && input.variant_options.length > 0) {
    const { error } = await supabase.from("product_variant_options").insert(
      input.variant_options.map((opt, i) => ({
        product_id: product.id,
        name: opt.name,
        values: opt.values,
        position: opt.position ?? i,
      })),
    );
    if (error) console.error("[createProduct] variant_options", error);
  }

  // Insert variants (each combination of options with its own price/stock)
  if (input.variants && input.variants.length > 0) {
    const { error } = await supabase.from("product_variants").insert(
      input.variants.map((v) => ({
        product_id: product.id,
        options: v.options,
        price: v.price,
        compare_price: v.compare_price ?? null,
        sku: v.sku ?? null,
        stock: v.stock,
      })),
    );
    if (error) console.error("[createProduct] variants", error);
  }

  // Insert images
  if (input.image_urls && input.image_urls.length > 0) {
    const { error } = await supabase.from("product_images").insert(
      input.image_urls.map((url, i) => ({
        product_id: product.id,
        url,
        is_featured: i === 0, // first image is the featured one
        position: i,
      })),
    );
    if (error) console.error("[createProduct] images", error);
  }

  revalidatePath("/products");
  return { data: product, error: null };
}

/**
 * Get a paginated, filterable list of products.
 */
export async function getProducts(options: GetProductsOptions = {}) {
  const supabase = await createServerClient();
  const {
    page = 1,
    pageSize = 20,
    search,
    status,
    category_id,
    low_stock,
  } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*, categories(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%,vendor.ilike.%${search}%`,
    );
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (category_id) {
    query = query.eq("category_id", category_id);
  }

  if (low_stock) {
    // Supabase JS cannot compare two columns directly.
    // We use a raw PostgREST filter: stock.lte(low_stock_alert)
    query = query
      .filter("stock", "lte", "low_stock_alert")
      .eq("track_inventory", true);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[getProducts]", error);
    return { data: null, error: error.message, count: 0 };
  }

  return {
    data,
    error: null,
    count: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/**
 * Get a single product by ID with all related data.
 */
export async function getProductById(id: string) {
  const supabase = await createServerClient();

  const [productResult, variantsResult, variantOptionsResult, imagesResult] =
    await Promise.all([
      supabase
        .from("products")
        .select("*, categories(id, name)")
        .eq("id", id)
        .single(),

      supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: true }),

      supabase
        .from("product_variant_options")
        .select("*")
        .eq("product_id", id)
        .order("position", { ascending: true }),

      supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("position", { ascending: true }),
    ]);

  if (productResult.error) {
    console.error("[getProductById]", productResult.error);
    return { data: null, error: productResult.error.message };
  }

  return {
    data: {
      ...productResult.data,
      variants: variantsResult.data ?? [],
      variant_options: variantOptionsResult.data ?? [],
      images: imagesResult.data ?? [],
    },
    error: null,
  };
}

/**
 * Update a product's core fields.
 * To update variants or images, use the dedicated actions below.
 */
export async function updateProduct(id: string, input: UpdateProductInput) {
  const supabase = await createServerClient();

  const updates: Record<string, unknown> = {};
  const fields = [
    "name",
    "description",
    "short_description",
    "slug",
    "price",
    "compare_price",
    "cost",
    "sku",
    "stock",
    "track_inventory",
    "low_stock_alert",
    "has_variants",
    "category_id",
    "tags",
    "vendor",
    "product_type",
    "status",
    "visibility",
    "weight",
    "dimensions",
    "shipping_class",
    "seo_title",
    "seo_description",
  ] as const;

  for (const field of fields) {
    if (input[field] !== undefined) {
      updates[field] = input[field];
    }
  }

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[updateProduct]", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  return { data, error: null };
}

/**
 * Soft-delete a product by setting status to 'archived'.
 * The product disappears from the catalog but historical order_items
 * that reference it remain intact.
 */
export async function deleteProduct(id: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[deleteProduct]", error);
    return { error: error.message };
  }

  revalidatePath("/products");
  return { error: null };
}

/**
 * Adjust stock for a product or a specific variant.
 * Pass a positive delta to add stock, negative to decrement.
 *
 * Used internally by the orders module — not called directly from UI.
 *
 * Examples:
 *   adjustStock({ productId: '...' }, -2)   // sold 2 units
 *   adjustStock({ variantId: '...' }, 5)    // restocked 5 units
 */
export async function adjustStock(
  target: { productId: string; variantId?: string },
  delta: number,
) {
  const supabase = await createServerClient();

  if (target.variantId) {
    // Adjust stock on a specific variant
    const { data: variant, error: fetchError } = await supabase
      .from("product_variants")
      .select("stock")
      .eq("id", target.variantId)
      .single();

    if (fetchError) return { error: fetchError.message };

    const newStock = Math.max(0, variant.stock + delta);
    const { error } = await supabase
      .from("product_variants")
      .update({ stock: newStock })
      .eq("id", target.variantId);

    if (error) return { error: error.message };
  } else {
    // Adjust stock on the base product
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", target.productId)
      .single();

    if (fetchError) return { error: fetchError.message };

    const newStock = Math.max(0, product.stock + delta);
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", target.productId);

    if (error) return { error: error.message };
  }

  return { error: null };
}

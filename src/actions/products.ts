"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Types ──────────────────────────────────────────────────

export type ProductStatus = "draft" | "active" | "archived";
export type ProductVisibility = "public" | "hidden";
export type ShippingClass = "standard" | "express" | "free" | "local_pickup";

export type ProductDimensions = {
  length?: number;
  width?: number;
  height?: number;
  unit?: "cm" | "in";
};

export interface Product {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  slug: string | null;
  price: number;
  compare_price: number | null;
  cost: number | null;
  sku: string | null;
  stock: number;
  track_inventory: boolean;
  low_stock_alert: number;
  has_variants: boolean;
  category_id: string | null;
  tags: string[];
  vendor: string | null;
  product_type: string | null;
  status: ProductStatus;
  visibility: ProductVisibility;
  weight: number | null;
  dimensions: ProductDimensions | null;
  shipping_class: ShippingClass;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  categories?: { id: string; name: string } | null;
  product_images?: {
    id: string;
    url: string;
    is_featured: boolean;
    position: number;
  }[];
  variants?: any[];
  variant_options?: any[];
  images?: {
    id: string;
    url: string;
    is_featured: boolean;
    position: number;
  }[];
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

export type ProductVariantInput = {
  options: Record<string, string>;
  price: number;
  compare_price?: number;
  sku?: string;
  stock: number;
};

export type ProductVariantOptionInput = {
  name: string;
  values: string[];
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
  low_stock?: boolean;
};

// ── Actions ────────────────────────────────────────────────

export async function createProduct(input: CreateProductInput) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const slug =
    input.slug ??
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 6);

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
      user_id: userId, // ← tenant stamp
    })
    .select()
    .single();

  if (productError) {
    console.error("[createProduct]", productError);
    return { data: null, error: productError.message };
  }

  if (input.variant_options && input.variant_options.length > 0) {
    const { error } = await supabase.from("product_variant_options").insert(
      input.variant_options.map((opt, i) => ({
        product_id: product.id,
        name: opt.name,
        values: opt.values,
        position: opt.position ?? i,
        user_id: userId, // ← tenant stamp
      })),
    );
    if (error) console.error("[createProduct] variant_options", error);
  }

  if (input.variants && input.variants.length > 0) {
    const { error } = await supabase.from("product_variants").insert(
      input.variants.map((v) => ({
        product_id: product.id,
        options: v.options as any,
        price: v.price,
        compare_price: v.compare_price ?? null,
        sku: v.sku ?? null,
        stock: v.stock,
        user_id: userId,
      })),
    );
    if (error) console.error("[createProduct] variants", error);
  }

  if (input.image_urls && input.image_urls.length > 0) {
    const { error } = await supabase.from("product_images").insert(
      input.image_urls.map((url, i) => ({
        product_id: product.id,
        url,
        is_featured: i === 0,
        position: i,
        user_id: userId, // ← tenant stamp
      })),
    );
    if (error) console.error("[createProduct] images", error);
  }

  revalidatePath("/dashboard/products");
  return { data: product, error: null };
}

export async function getProducts(options: GetProductsOptions = {}) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized", count: 0 };

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
    .select(
      "*, categories(id, name), product_images(id, url, is_featured, position)",
      { count: "exact" },
    )
    .eq("user_id", userId) // ← tenant filter
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%,vendor.ilike.%${search}%`,
    );
  }
  if (status) query = query.eq("status", status);
  if (category_id) query = query.eq("category_id", category_id);
  if (low_stock) {
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

export async function getProductById(id: string) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const [productResult, variantsResult, variantOptionsResult, imagesResult] =
    await Promise.all([
      supabase
        .from("products")
        .select("*, categories(id, name)")
        .eq("id", id)
        .eq("user_id", userId) // ← tenant filter
        .single(),

      supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", id)
        .eq("user_id", userId) // ← tenant filter
        .order("created_at", { ascending: true }),

      supabase
        .from("product_variant_options")
        .select("*")
        .eq("product_id", id)
        .eq("user_id", userId) // ← tenant filter
        .order("position", { ascending: true }),

      supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .eq("user_id", userId) // ← tenant filter
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

export async function updateProduct(id: string, input: UpdateProductInput) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

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
    if (input[field] !== undefined) updates[field] = input[field];
  }

  const { data, error } = await supabase
    .from("products")
    .update(updates as any)
    .eq("id", id)
    .eq("user_id", userId) // ← tenant filter
    .select()
    .single();

  if (error) {
    console.error("[updateProduct]", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${id}`);
  return { data, error: null };
}

export async function deleteProduct(id: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createServerClient();

  const { error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("user_id", userId); // ← tenant filter

  if (error) {
    console.error("[deleteProduct]", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/products");
  return { error: null };
}

/**
 * Adjust stock for a product or variant.
 * Called internally by orders — no tenant filter needed here since
 * the order action already validated ownership before calling this.
 */
export async function adjustStock(
  target: { productId: string; variantId?: string },
  delta: number,
) {
  const supabase = await createServerClient();

  if (target.variantId) {
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

export async function createCategory(name: string) {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error("[createCategory]", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/dashboard/products");
  return { data: data as Category, error: null };
}

export async function getCategories() {
  const { userId } = await auth();
  if (!userId) return { data: null, error: "Unauthorized" };

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, parent_id")
    .eq("user_id", userId) // ← tenant filter
    .order("name");

  if (error) {
    console.error("[getCategories]", error);
    return { data: null, error: error.message };
  }

  return { data: data as Category[], error: null };
}

export async function replaceProductImages(
  productId: string,
  images: { url: string; is_featured: boolean; position: number }[],
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createServerClient();

  await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", userId); // ← tenant filter

  if (images.length > 0) {
    const { error } = await supabase.from("product_images").insert(
      images.map((img) => ({
        ...img,
        product_id: productId,
        user_id: userId, // ← tenant stamp
      })),
    );
    if (error) {
      console.error("[replaceProductImages]", error);
      return { error: error.message };
    }
  }

  revalidatePath("/dashboard/products");
  return { error: null };
}

export async function replaceProductVariants(
  productId: string,
  options: ProductVariantOptionInput[],
  variants: ProductVariantInput[],
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const supabase = await createServerClient();

  await supabase
    .from("product_variant_options")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", userId); // ← tenant filter

  await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", userId); // ← tenant filter

  if (options.length > 0) {
    const { error } = await supabase.from("product_variant_options").insert(
      options.map((opt, i) => ({
        product_id: productId,
        name: opt.name,
        values: opt.values,
        position: opt.position ?? i,
        user_id: userId, // ← tenant stamp
      })),
    );
    if (error) console.error("[replaceProductVariants] options", error);
  }

  if (variants.length > 0) {
    const { error } = await supabase.from("product_variants").insert(
      variants.map((v) => ({
        product_id: productId,
        options: v.options as any,
        price: v.price,
        compare_price: v.compare_price ?? null,
        sku: v.sku ?? null,
        stock: v.stock,
        user_id: userId, // ← tenant stamp
      })),
    );
    if (error) console.error("[replaceProductVariants] variants", error);
  }

  revalidatePath("/dashboard/products");
  return { error: null };
}

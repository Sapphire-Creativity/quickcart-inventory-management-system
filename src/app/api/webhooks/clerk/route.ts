import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Supabase admin client (bypasses RLS) ──────────────────
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

// ── Clerk webhook event types ─────────────────────────────
type ClerkUserData = {
  id: string;
  email_addresses: { email_address: string; id: string }[];
  first_name: string | null;
  last_name: string | null;
  primary_email_address_id: string;
};

type ClerkWebhookEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkUserData;
};

// ── Route Handler ─────────────────────────────────────────
export async function POST(req: Request) {
  // ── Step 1: Verify the webhook signature ────────────────
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[webhook] CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let event: ClerkWebhookEvent;

  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("[webhook] Invalid signature:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  // ── Step 2: Handle the event ─────────────────────────────
  const supabase = createAdminClient();
  const { type, data } = event;

  console.log(`[webhook] Received event: ${type} for user: ${data.id}`);

  // Get primary email
  const primaryEmail =
    data.email_addresses.find((e) => e.id === data.primary_email_address_id)
      ?.email_address ?? "";

  // Full name from first + last
  const fullName =
    [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

  // ── user.created ─────────────────────────────────────────
  if (type === "user.created") {
    const { error } = await supabase.from("admin_profiles").insert({
      id: data.id,
      user_id: data.id,
      email: primaryEmail,
      full_name: fullName,
      role: "admin",
    });

    if (error) {
      console.error("[webhook] Failed to create admin profile:", error);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 },
      );
    }

    console.log(`[webhook] Created admin profile for ${primaryEmail}`);
  }

  // ── user.updated ─────────────────────────────────────────
  if (type === "user.updated") {
    const { error } = await supabase
      .from("admin_profiles")
      .update({
        email: primaryEmail,
        full_name: fullName,
      })
      .eq("id", data.id);

    if (error) {
      console.error("[webhook] Failed to update admin profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    console.log(`[webhook] Updated admin profile for ${primaryEmail}`);
  }

  // ── user.deleted ─────────────────────────────────────────
  if (type === "user.deleted") {
    const { error } = await supabase
      .from("admin_profiles")

      .delete()
      .eq("id", data.id); // ✅ matches your table's primary key

    if (error) {
      console.error("[webhook] Failed to delete admin profile:", error);
      return NextResponse.json(
        { error: "Failed to delete profile" },
        { status: 500 },
      );
    }

    console.log(`[webhook] Deleted admin profile for user: ${data.id}`);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

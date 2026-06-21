<div align="center">

<img src="https://quickcart-inventory-management-syst.vercel.app/logo.png" alt="QuickCart Logo" width="80" height="80" />

# QuickCart

### Multi-tenant Ecommerce Inventory Management System

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?style=for-the-badge&logo=vercel)](https://quickcart-inventory-management-syst.vercel.app/)

**[🚀 Live Demo](https://quickcart-inventory-management-syst.vercel.app/) · [📖 Documentation](#-getting-started) · [🐛 Report Bug](https://github.com/Sapphire-Creativity/quickcart/issues) · [✨ Request Feature](https://github.com/Sapphire-Creativity/quickcart/issues)**

</div>

---

## 📸 Screenshots

<div align="center">

### Dashboard Overview
![QuickCart Dashboard](https://raw.githubusercontent.com/Sapphire-Creativity/quickcart/main/public/screenshots/dashboard.png)
*Real-time revenue tracking, weekly reports, and top products at a glance*

### Orders Management
![QuickCart Orders](https://raw.githubusercontent.com/Sapphire-Creativity/quickcart/main/public/screenshots/orders.png)
*Create, track, and manage orders with customer assignment and status updates*

### Customer Management
![QuickCart Customers](https://raw.githubusercontent.com/Sapphire-Creativity/quickcart/main/public/screenshots/customers.png)
*Full customer profiles with order history, spend tracking, and status management*

### Transactions
![QuickCart Transactions](https://raw.githubusercontent.com/Sapphire-Creativity/quickcart/main/public/screenshots/transactions.png)
*Payment transaction history with CSV export and date range filtering*

### Product Catalog
![QuickCart Products](https://raw.githubusercontent.com/Sapphire-Creativity/quickcart/main/public/screenshots/products.png)
*Manage your full product inventory with SKU, stock, categories, and variants*

### Add Product
![QuickCart Add Product](https://raw.githubusercontent.com/Sapphire-Creativity/quickcart/main/public/screenshots/add-product.png)
*Rich product creation form with variants, SEO, shipping, and image management*

</div>

---

## 🧐 About

**QuickCart** is a fully-featured, multi-tenant ecommerce inventory management system built for store owners who need a clean, fast, and secure admin panel. Each admin account gets a completely isolated store — products, orders, customers, and transactions are all scoped to the logged-in user via Supabase Row Level Security.

Built with modern tools: **Next.js 15 App Router**, **TypeScript**, **Supabase** (Postgres + RLS), **Clerk** (authentication + webhooks), **Tailwind CSS**, and **Framer Motion**.

---

## ✨ Features

### 🏪 Multi-tenant Architecture
- Every admin sees only their own store's data
- Row Level Security (RLS) enforced at the database level
- Clerk JWT tokens passed to Supabase for per-user data isolation
- Webhook-powered automatic profile creation on sign up

### 📊 Dashboard
- Real-time KPI cards — revenue, orders, pending, cancelled
- Weekly revenue chart (this week vs last week) powered by Recharts
- Top products by units sold
- Recent transactions table
- Week-over-week percentage change indicators

### 🛒 Orders
- Create orders with a 3-step flow: Products → Customer → Review
- Real-time stock validation before order creation
- Assign customers to orders (search existing or create new inline)
- Order status management: Pending → Processing → Completed → Cancelled
- Auto-creates transaction record when order is completed
- Auto-restores stock when order is cancelled
- Delete pending orders with stock restoration
- Bulk status updates
- Filter by status, payment status, date range

### 👥 Customers
- Full customer profiles with address, notes, status (Active/Inactive/VIP)
- Order history per customer
- Spend tracking and average order value (via Supabase view)
- Search by name, phone, or email
- Guard against deleting customers with active orders

### 💳 Transactions
- Auto-generated when orders are completed
- Filter by type (sale/refund), status, date range
- Page net total footer for quick reconciliation
- Export to CSV
- Transaction details drawer with linked order and customer info

### 📦 Products
- Full product creation with variants, images, SEO, shipping
- Product variant support (Color × Size combinations)
- Stock tracking with low stock alerts
- Categories management (create inline while adding a product)
- Soft-delete (archive) products — historical order items stay intact
- Per-user slug and SKU uniqueness

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Animation | [Framer Motion](https://www.framer-motion.com/) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth | [Clerk](https://clerk.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Icons | [React Icons](https://react-icons.github.io/react-icons/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project
- A [Clerk](https://clerk.com/) application

### 1. Clone the repository

```bash
git clone https://github.com/Sapphire-Creativity/quickcart.git
cd quickcart
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
```

### 3. Set up Supabase

Run the following SQL in your Supabase SQL editor to set up the database schema, RLS policies, and required enums:

<details>
<summary>📋 Click to expand SQL setup</summary>

```sql
-- Enable RLS on all tables
ALTER TABLE admin_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions       ENABLE ROW LEVEL SECURITY;

-- Add user_id to all tables
ALTER TABLE admin_profiles         ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE categories             ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE customers              ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE orders                 ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE order_items            ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE products               ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE product_variants       ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE product_images         ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE product_variant_options ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE transactions           ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Helper function for Clerk JWT
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT AS $$
  SELECT auth.jwt() ->> 'sub';
$$ LANGUAGE SQL STABLE;

-- RLS Policies (repeat for each table)
CREATE POLICY "users can manage own data"
  ON orders FOR ALL
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());
```

</details>

### 4. Set up Clerk

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. In Clerk Dashboard → **JWT Templates** → Create a template named `supabase`
3. In Clerk Dashboard → **Webhooks** → Add endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`
4. Copy the **Signing Secret** to `CLERK_WEBHOOK_SECRET`

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
quickcart/
├── src/
│   ├── actions/              # Server actions
│   │   ├── orders.ts         # Order CRUD + stock management
│   │   ├── customers.ts      # Customer CRUD + search
│   │   ├── products.ts       # Product CRUD + variants + categories
│   │   ├── transactions.ts   # Transaction queries + dashboard summary
│   │   └── dashboard.ts      # KPIs, weekly revenue, top products
│   ├── app/
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   └── dashboard/
│   │   │       ├── page.tsx          # Dashboard home
│   │   │       ├── orders/           # Orders page
│   │   │       ├── customers/        # Customers page
│   │   │       ├── transactions/     # Transactions page
│   │   │       ├── products/         # Products list
│   │   │       ├── add-product/      # Add/edit product
│   │   │       └── error.tsx         # Dashboard error boundary
│   │   ├── api/
│   │   │   └── webhooks/clerk/       # Clerk webhook handler
│   │   ├── not-found.tsx             # Custom 404 page
│   │   └── error.tsx                 # Global error boundary
│   ├── components/
│   │   ├── dashboard/        # KPI cards, charts, widgets
│   │   ├── layout/           # Sidebar, navbar
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   └── supabase/         # Supabase client (server + client)
│   └── types/
│       └── supabase.ts       # Auto-generated Supabase types
```

---

## 🔐 Security

- **Row Level Security** — All database queries are scoped to the authenticated user via Supabase RLS policies
- **Server Actions** — All data mutations happen server-side with `auth()` checks
- **Clerk JWT** — Supabase verifies Clerk-signed JWTs on every request
- **Webhook verification** — Clerk webhooks are verified via `svix` signature checking
- **Guard rails** — Cannot delete customers with active orders, cannot modify completed/cancelled orders

---

## 🗂️ Database Schema

```
admin_profiles     — Clerk user profiles (auto-created via webhook)
categories         — Product categories (per user)
products           — Product catalog with inventory tracking
product_variants   — Size/color variant combinations
product_variant_options — Variant option definitions
product_images     — Product image URLs
customers          — Customer profiles
customer_metrics   — View: customers + aggregated order stats
orders             — Order records
order_items        — Line items per order (with product snapshots)
transactions       — Payment records (auto-created on order completion)
```

---

## 📦 Deployment

### Deploy to Vercel

```bash
# Build locally first to catch errors
npm run build

# Push to GitHub
git add .
git commit -m "ready for deployment"
git push

# Then import your repo at vercel.com
```

Add all environment variables from `.env.local` to your Vercel project settings, then update your Clerk webhook URL to your production Vercel URL.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ by [Sapphire-Creativity](https://github.com/Sapphire-Creativity)

⭐ **Star this repo if you found it helpful!**

</div>

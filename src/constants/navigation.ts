// ─────────────────────────────────────────────────────────────────────────────
// DEALPORT — Navigation Constants
// ─────────────────────────────────────────────────────────────────────────────
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Tag,
  Grid3X3,
  CreditCard,
  Bookmark,
  PlusCircle,
  ImageIcon,
  List,
  Star,
  ShieldCheck,
  Settings2,
} from "@/components/icons";
import type { NavSection } from "../../types";

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main menu",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/dashboard",
        active: true,
      },
      { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders" },
      { icon: Users, label: "Customers", href: "/dashboard/customers" },
      { icon: Tag, label: "Coupons", href: "/dashboard/coupons" },
      { icon: Grid3X3, label: "Categories", href: "/dashboard/categories" },
      {
        icon: CreditCard,
        label: "Transactions",
        href: "/dashboard/transactions",
      },
      { icon: Bookmark, label: "Brands", href: "/brands" },
    ],
  },
  {
    label: "Product",
    items: [
      { icon: PlusCircle, label: "Add Product", href: "/products/new" },
      { icon: ImageIcon, label: "Product Media", href: "/products/media" },
      { icon: List, label: "Product List", href: "/products" },
      { icon: Star, label: "Reviews", href: "/products/reviews" },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: ShieldCheck, label: "Roles", href: "/admin/roles" },
      { icon: Settings2, label: "Authority", href: "/admin/authority" },
    ],
  },
];

export const USER_PROFILE = {
  name: "Dealport",
  email: "mark@thedesigner.io",
  avatarUrl: "https://i.pravatar.cc/40?img=12",
  shopUrl: "https://dealport.shop",
} as const;

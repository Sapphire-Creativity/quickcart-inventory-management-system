// ─────────────────────────────────────────────────────────────────────────────
// DEALPORT — Dashboard Data Constants
// ─────────────────────────────────────────────────────────────────────────────
import type {
  WeeklyDataPoint,
  MinuteDataPoint,
  WeeklyMetric,
  Transaction,
  Product,
  CountrySalesData,
} from "../../types";

export const THIS_WEEK_DATA: WeeklyDataPoint[] = [
  { day: "Sun", value: 15000 },
  { day: "Mon", value: 18000 },
  { day: "Tue", value: 16000 },
  { day: "Wed", value: 20000 },
  { day: "Thu", value: 14000 },
  { day: "Fri", value: 26000 },
  { day: "Sat", value: 30000 },
];

export const LAST_WEEK_DATA: WeeklyDataPoint[] = [
  { day: "Sun", value: 12000 },
  { day: "Mon", value: 22000 },
  { day: "Tue", value: 19000 },
  { day: "Wed", value: 17000 },
  { day: "Thu", value: 23000 },
  { day: "Fri", value: 20000 },
  { day: "Sat", value: 25000 },
];

export const USERS_PER_MINUTE: MinuteDataPoint[] = [
  { t: "1", v: 60 },
  { t: "2", v: 80 },
  { t: "3", v: 55 },
  { t: "4", v: 90 },
  { t: "5", v: 70 },
  { t: "6", v: 100 },
  { t: "7", v: 65 },
  { t: "8", v: 85 },
  { t: "9", v: 75 },
  { t: "10", v: 95 },
  { t: "11", v: 60 },
  { t: "12", v: 80 },
  { t: "13", v: 70 },
  { t: "14", v: 90 },
  { t: "15", v: 55 },
  { t: "16", v: 85 },
  { t: "17", v: 75 },
  { t: "18", v: 95 },
  { t: "19", v: 65 },
  { t: "20", v: 100 },
];

export const WEEKLY_METRICS: WeeklyMetric[] = [
  { label: "Customers", value: "52k", active: true },
  { label: "Total Products", value: "3.5k" },
  { label: "In Stock", value: "2.5k" },
  { label: "Out of Stock", value: "0.5k" },
  { label: "Revenue", value: "$250k" },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    customerId: "#6545",
    orderDate: "01 Oct · 11:29 am",
    status: "Paid",
    amount: "$64",
  },
  {
    id: 2,
    customerId: "#5412",
    orderDate: "01 Oct · 11:29 am",
    status: "Pending",
    amount: "$557",
  },
  {
    id: 3,
    customerId: "#9841",
    orderDate: "01 Oct · 10:15 am",
    status: "Paid",
    amount: "$128",
  },
  {
    id: 4,
    customerId: "#3302",
    orderDate: "01 Oct · 09:44 am",
    status: "Cancelled",
    amount: "$340",
  },
  {
    id: 5,
    customerId: "#7723",
    orderDate: "01 Oct · 09:01 am",
    status: "Paid",
    amount: "$89",
  },
];

export const TOP_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Apple iPhone 13",
    sku: "#FXZ-4567",
    price: "$999.00",
    emoji: "📱",
    color: "#1a1a2e",
  },
  {
    id: "p2",
    name: "Samsung Galaxy S22",
    sku: "#FXZ-4568",
    price: "$849.00",
    emoji: "📱",
    color: "#16213e",
  },
  {
    id: "p3",
    name: "Sony WH-1000XM5",
    sku: "#FXZ-4569",
    price: "$349.00",
    emoji: "🎧",
    color: "#0f3460",
  },
  {
    id: "p4",
    name: 'MacBook Pro 14"',
    sku: "#FXZ-4570",
    price: "$1,999.00",
    emoji: "💻",
    color: "#2d1b69",
  },
];

export const COUNTRY_SALES: CountrySalesData[] = [
  {
    name: "United States",
    value: "30k",
    change: "+25.8%",
    trendUp: true,
    flag: "🇺🇸",
    barPercent: 72,
  },
  {
    name: "Brazil",
    value: "30k",
    change: "−15.8%",
    trendUp: false,
    flag: "🇧🇷",
    barPercent: 55,
  },
  {
    name: "Australia",
    value: "25k",
    change: "+35.8%",
    trendUp: true,
    flag: "🇦🇺",
    barPercent: 65,
  },
];

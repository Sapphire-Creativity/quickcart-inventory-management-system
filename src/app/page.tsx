import HomePageInner from "@/components/dashboard/HomePageInner";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomePageInner />
    </Suspense>
  )
}
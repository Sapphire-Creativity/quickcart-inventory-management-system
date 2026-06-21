import CustomersPageInner from "@/components/dashboard/CustomersPageInner";
import { Suspense } from "react";

export default function CustomersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    }>
      <CustomersPageInner />
    </Suspense>
  )
}
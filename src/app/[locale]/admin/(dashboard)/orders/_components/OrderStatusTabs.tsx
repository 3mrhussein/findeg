"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrderStatus } from "@/features/core/domain/types/common";

interface OrderStatusTabsProps {
  counts: {
    all: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

const STATUS_TABS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function OrderStatusTabs({ counts }: OrderStatusTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    // Reset to page 1 when changing status
    params.delete("page");

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <Tabs value={currentStatus} onValueChange={handleTabChange}>
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        {STATUS_TABS.map((tab) => {
          const count = counts[tab.value as keyof typeof counts];

          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 gap-2"
            >
              <span>{tab.label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted font-medium">
                {count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

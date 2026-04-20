"use client";

import { useTransition } from "react";
import { Badge } from "@findeg/ui";
import { ScrollArea, ScrollBar } from "@findeg/ui";
import { Button } from "@findeg/ui";

/**
 * OrderStatus type (local definition)
 */
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

interface OrderStatusPillsProps {
  statusCounts: Record<string, number>;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  total: number;
}

const STATUSES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

/**
 *
 */
export function OrderStatusPills({
  statusCounts,
  activeStatus,
  onStatusChange,
  total,
}: OrderStatusPillsProps) {
  const [isPending, startTransition] = useTransition();

  /**
   *
   */
  const handleStatusClick = (status: string) => {
    if (activeStatus === status) return;
    startTransition(() => {
      onStatusChange(status);
    });
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap pb-4">
      <div className="flex w-max space-x-2">
        {STATUSES.map((status) => {
          const count = status.value === "all" ? total : statusCounts[status.value] || 0;
          const isActive = activeStatus === status.value;

          return (
            <Button
              key={status.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`rounded-full shadow-sm transition-opacity ${isPending ? "opacity-70" : "opacity-100"}`}
              onClick={() => handleStatusClick(status.value)}
            >
              {status.label}
              <Badge
                variant={isActive ? "secondary" : "default"}
                className="ml-2 bg-background/20 hover:bg-background/20 border-transparent text-current px-1.5 py-0 min-w-4 text-center"
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}

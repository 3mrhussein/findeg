"use client";

import { Check } from "lucide-react";

interface OrderTimelineProps {
  status: string;
}

const steps = [
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
];

/**
 *
 */
export function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === "cancelled" || status === "refunded") {
    return (
      <div className="w-full bg-destructive/10 p-4 rounded-lg flex items-center justify-center border border-destructive/20">
        <span className="text-destructive font-semibold uppercase tracking-wider">
          Order {status}
        </span>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.id === status);

  return (
    <div className="w-full bg-card border rounded-lg p-6">
      <div className="relative flex justify-between">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{
              width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="relative flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 transition-colors duration-300 ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted text-muted-foreground"
                } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

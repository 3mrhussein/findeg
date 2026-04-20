/**
 * SlideOver Component
 *
 * Right-side slide-over panel wrapper (wraps shadcn Sheet).
 * Used for quick actions, detail views, and lightweight forms.
 *
 * Location: src/app/[locale]/admin/_components/shared/ (admin-wide)
 */

"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@findeg/ui";
import { cn } from "@lib/utils";

export interface SlideOverProps {
  /** Panel open state */
  open: boolean;
  /** Close handler */
  onOpenChange: (open: boolean) => void;
  /** Panel title */
  title: string;
  /** Optional description */
  description?: string;
  /** Panel content */
  children: React.ReactNode;
  /** Width variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

/**
 * SlideOver — Slide-over panel wrapper
 *
 * @example
 * <SlideOver
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Order Details"
 *   description="View and manage order #1042"
 *   size="lg"
 * >
 *   <OrderDetailContent orderId={orderId} />
 * </SlideOver>
 */
export function SlideOver({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "lg",
  className,
}: SlideOverProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn(SIZE_CLASSES[size], className)}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

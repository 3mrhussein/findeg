"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@findeg/ui";
import { BrandFormPanel } from "./BrandFormPanel";
import { Brand } from "@/features/catalog/domain/entities/Brand";
import { BrandInput } from "@/features/administration/domain/types";

interface BrandDrawerProps {
  open: boolean;
  onClose: () => void;
  brand: Brand | null;
  productCount?: number;
  onSubmit: (data: BrandInput) => Promise<any>;
}

export function BrandDrawer({
  open,
  onClose,
  brand,
  productCount = 0,
  onSubmit,
}: BrandDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] p-0 rounded-t-[32px] border-none overflow-hidden"
      >
        <BrandFormPanel
          brand={brand}
          productCount={productCount}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}

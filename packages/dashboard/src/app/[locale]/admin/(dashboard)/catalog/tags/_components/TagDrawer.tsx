"use client";

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@findeg/ui";
import { Tag } from "@/features/catalog/domain/entities/Tag";
import { TagInput } from "@/features/administration/domain/types";
import { TagFormPanel } from "./TagFormPanel";
import {
  adminCreateTagAction,
  adminUpdateTagAction,
  adminGetTagProductCountAction,
} from "@/features/administration/application/actions/admin-tag-actions";
import { useRouter } from "next/navigation";

interface TagDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
}

export function TagDrawer({ open, onOpenChange, tag }: TagDrawerProps) {
  const router = useRouter();
  const [productCount, setProductCount] = useState<number>(0);

  useEffect(() => {
    if (tag?.id) {
      adminGetTagProductCountAction(Number(tag.id)).then((res) => {
        if (res.success) setProductCount(res.count || 0);
      });
    } else if (productCount !== 0) {
      setProductCount(0);
    }
  }, [tag, productCount]);

  const handleSubmit = async (data: TagInput) => {
    const res = tag
      ? await adminUpdateTagAction(Number(tag.id), data)
      : await adminCreateTagAction(data);

    if (res.success) {
      onOpenChange(false);
      router.refresh();
    }
    return res;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] p-0 border-l dark:border-slate-800">
        <TagFormPanel
          tag={tag}
          productCount={productCount}
          onSubmit={handleSubmit}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

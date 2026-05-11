'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@findeg/ui';
import { Tag } from '@findeg/backend/features/catalog';
import type { TagInput } from '@findeg/backend/features/catalog/application/dtos/TagInput';
import { TagFormPanel } from './TagFormPanel';
import { createTagAction, updateTagAction, getTagProductCountAction } from '@data/tags/actions';
import { useRouter } from '@i18n/navigation';

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
      getTagProductCountAction(Number(tag.id)).then((res) => {
        if (res.success) setProductCount(res.count || 0);
      });
    } else if (productCount !== 0) {
      Promise.resolve().then(() => setProductCount(0));
    }
  }, [tag, productCount]);

  const handleSubmit = async (data: TagInput) => {
    const res = tag ? await updateTagAction(Number(tag.id), data) : await createTagAction(data);

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

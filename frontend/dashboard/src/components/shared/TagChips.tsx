/**
 * TagChips Component
 *
 * Displays tags as colored chips with overflow handling.
 * Used in admin product rows and storefront product cards.
 *
 * Location: src/components/shared/ (cross-cutting)
 */

"use client";

import * as React from "react";
import { Badge } from "@findeg/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@findeg/ui";
import { cn } from "@lib/utils";
import { X } from "lucide-react";

export interface Tag {
  id: number;
  name: string;
  nameAr?: string;
  color?: string;
}

export interface TagChipsProps {
  /** Array of tags to display */
  tags: Tag[];
  /** Maximum tags to show inline before "show more" (default: 3) */
  maxVisible?: number;
  /** Enable remove functionality (for edit mode) */
  onRemove?: (tagId: number) => void;
  /** Current locale for bilingual support */
  locale?: "en" | "ar";
  /** Additional CSS classes */
  className?: string;
}

/**
 * TagChips — Tag display with overflow popover
 *
 * @example
 * <TagChips
 *   tags={product.tags}
 *   maxVisible={3}
 *   locale="en"
 *   onRemove={(id) => handleRemoveTag(id)}
 * />
 */
export function TagChips({
  tags,
  maxVisible = 3,
  onRemove,
  locale = "en",
  className,
}: TagChipsProps) {
  if (!tags || tags.length === 0) return null;

  const visibleTags = tags.slice(0, maxVisible);
  const hiddenTags = tags.slice(maxVisible);
  const hasMore = hiddenTags.length > 0;

  const renderTagChip = (tag: Tag, showRemove = true) => {
    const tagName = locale === "ar" && tag.nameAr ? tag.nameAr : tag.name;
    const bgColor = tag.color || "#6b7280";

    return (
      <Badge
        key={tag.id}
        variant="outline"
        className={cn(
          "gap-1 border-0 px-2 py-0.5 text-xs font-medium",
          onRemove && showRemove && "pe-1",
        )}
        style={{
          backgroundColor: `${bgColor}15`,
          color: bgColor,
        }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: bgColor }}
          aria-hidden="true"
        />
        <span>{tagName}</span>
        {onRemove && showRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(tag.id);
            }}
            className="ms-1 inline-flex h-3 w-3 items-center justify-center rounded-full hover:bg-black/10"
            aria-label={`Remove ${tagName}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </Badge>
    );
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visibleTags.map((tag) => renderTagChip(tag))}

      {hasMore && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-pointer border-dashed bg-muted/30 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/50"
            >
              +{hiddenTags.length} more
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex flex-col gap-1.5">
              {hiddenTags.map((tag) => renderTagChip(tag))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

/**
 * CollapsibleCategoryPicker — A tree-view selector for narrow spaces (drawers).
 *
 * Features:
 * - List-based tree structure
 * - Expand/Collapse with +/- icons
 * - Click to select
 * - Visual nesting with indentation
 *
 * Location: src/app/[locale]/admin/_components/shared/
 */

'use client';

import * as React from 'react';
import { ChevronRight, ChevronDown, Plus, Minus, Check } from 'lucide-react';
import { cn } from '@lib/utils';
import type { Category } from '@findeg/backend/features/catalog';
import { Button } from '@findeg/ui';
import { ScrollArea } from '@findeg/ui';

interface CollapsibleCategoryPickerProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  placeholder?: string;
}

export function CollapsibleCategoryPicker({
  categories,
  selectedId,
  onSelect,
  placeholder = 'None',
}: CollapsibleCategoryPickerProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(new Set());

  const toggleExpand = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderItem = (category: Category, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    const isSelected = selectedId === category.id;

    return (
      <div key={category.id} className="flex flex-col">
        <div
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors group',
            isSelected
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300'
              : 'hover:bg-gray-50 dark:hover:bg-accent',
            depth > 0 && 'ml-4',
          )}
          onClick={() => onSelect(category.id)}
        >
          {/* Toggle Icon or Spacer */}
          <div className="shrink-0 w-4 h-4 flex items-center justify-center">
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-4 w-4 p-0 hover:bg-transparent',
                  isSelected
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover:text-foreground',
                )}
                onClick={(e) => toggleExpand(e, category.id)}
              >
                {isExpanded ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </Button>
            )}
          </div>

          <span className="flex-1 text-sm truncate">
            {category.localizedContent?.name?.en ?? category.slug}
          </span>

          {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5 border-l ml-4 pl-1 flex flex-col gap-0.5">
            {category.children!.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded-md bg-card overflow-hidden">
      <ScrollArea className="h-72">
        <div className="p-2 space-y-1">
          {/* "None" option */}
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
              selectedId === null
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300'
                : 'hover:bg-gray-50 dark:hover:bg-accent',
            )}
            onClick={() => onSelect(0)} // Use 0 for "None"
          >
            <div className="w-4" /> {/* Spacer */}
            <span className="flex-1 text-sm">{placeholder}</span>
            {selectedId === null && <Check className="h-3.5 w-3.5 shrink-0" />}
          </div>

          {categories.map((cat) => renderItem(cat))}
        </div>
      </ScrollArea>
    </div>
  );
}

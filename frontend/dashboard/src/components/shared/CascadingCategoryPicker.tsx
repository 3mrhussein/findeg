/**
 * CascadingCategoryPicker — Multi-column hierarchical category selector
 *
 * Features:
 * - Hover-based cascading (multi-column)
 * - 150ms delay before opening next column to avoid flicker
 * - Search/Filter within the picker
 * - Selected state highlighting
 * - Reusable in product forms and filters
 *
 * Location: src/components/shared/CascadingCategoryPicker.tsx
 */

"use client";

import * as React from "react";
import { ChevronRight, Check, Search, X } from "lucide-react";
import { cn } from "@lib/utils";
import { Button } from "@findeg/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@findeg/ui";
import { ScrollArea } from "@findeg/ui";
import type { Category } from "@findeg/backend/features/catalog";
import { useTranslations } from "next-intl";

interface CascadingCategoryPickerProps {
  /** Full tree of categories */
  categories: Category[];
  /** Currently selected category ID */
  selectedId?: number | string | null;
  /** Selection callback */
  onSelect: (id: number) => void;
  /** Trigger button label */
  placeholder?: string;
  /** Disable the picker */
  disabled?: boolean;
  /** Custom trigger className */
  className?: string;
}

/**
 * CascadingCategoryPicker
 */
export function CascadingCategoryPicker({
  categories,
  selectedId,
  onSelect,
  placeholder,
  disabled = false,
  className,
}: CascadingCategoryPickerProps) {
  const t = useTranslations("Administration.Catalog.Categories");
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  /** Path of active/hovered category IDs per level */
  const [activePath, setActivePath] = React.useState<number[]>([]);
  /** Timeout ref for hover delay */
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Find the hierarchy for the selectedId to initialize/highlight
  const findPath = React.useCallback(
    (targetId: number, nodes: Category[], path: number[] = []): number[] | null => {
      const search = (nodes: Category[], currentPath: number[]): number[] | null => {
        for (const node of nodes) {
          if (node.id === targetId) return [...currentPath, node.id];
          if (node.children) {
            const found = search(node.children, [...currentPath, node.id]);
            if (found) return found;
          }
        }
        return null;
      };
      return search(nodes, path);
    },
    [],
  );

  // Initialize active path when opening
  React.useEffect(() => {
    if (open && selectedId) {
      const path = findPath(Number(selectedId), categories);
      if (path) setActivePath(path.slice(0, -1)); // Show up to parent of selected
    } else if (!open) {
      setActivePath([]);
      setSearchQuery("");
    }
  }, [open, selectedId, categories, findPath]);

  const handleHover = (level: number, categoryId: number, hasChildren: boolean) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = setTimeout(() => {
      setActivePath((prev) => {
        const next = prev.slice(0, level);
        if (hasChildren) {
          next.push(categoryId);
        }
        return next;
      });
    }, 150); // 150ms delay required
  };

  const getVisibleColumns = () => {
    const columns: Category[][] = [categories];
    let currentLevel = categories;

    for (const id of activePath) {
      const parent = currentLevel.find((c) => c.id === id);
      if (parent?.children && parent.children.length > 0) {
        columns.push(parent.children);
        currentLevel = parent.children;
      } else {
        break;
      }
    }

    return columns;
  };

  const selectedCategory = React.useMemo(() => {
    if (!selectedId) return null;
    const findNode = (nodes: Category[]): Category | null => {
      for (const node of nodes) {
        if (node.id === Number(selectedId)) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findNode(categories);
  }, [categories, selectedId]);

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return null;
    const results: Category[] = [];
    const flattenAndFilter = (nodes: Category[]) => {
      for (const node of nodes) {
        if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push(node);
        }
        if (node.children) flattenAndFilter(node.children);
      }
    };
    flattenAndFilter(categories);
    return results;
  }, [categories, searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          {selectedCategory ? (
            <span className="flex items-center gap-2 truncate">
              {selectedCategory.icon && <span>{selectedCategory.icon}</span>}
              {selectedCategory.name}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder || t("SearchPlaceholder")}</span>
          )}
          <ChevronRight
            className={cn("ml-2 h-4 w-4 shrink-0 transition-transform", open && "rotate-90")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-[320px] p-0" align="start">
        <div className="flex flex-col h-[400px]">
          {/* Search Header */}
          <div className="flex items-center border-b px-3 py-2 shrink-0">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t("SearchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden">
            {searchQuery ? (
              /* Search Results View */
              <ScrollArea className="w-full">
                <div className="p-1">
                  {filteredCategories?.length ? (
                    filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        className={cn(
                          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                          String(selectedId) === String(cat.id) &&
                            "bg-accent/50 text-accent-foreground",
                        )}
                        onClick={() => {
                          onSelect(cat.id as number);
                          setOpen(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {cat.icon && <span>{cat.icon}</span>}
                          {cat.name}
                        </span>
                        {String(selectedId) === String(cat.id) && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No categories found.
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              /* Cascading Columns View */
              <div className="flex divide-x h-full">
                {getVisibleColumns().map((column, level) => (
                  <ScrollArea key={level} className="w-[180px] shrink-0 h-full">
                    <div className="p-1 space-y-0.5">
                      {column.map((cat) => {
                        const hasChildren = !!cat.children?.length;
                        const isActive = activePath[level] === cat.id;
                        const isSelected = String(selectedId) === String(cat.id);

                        return (
                          <button
                            key={cat.id}
                            className={cn(
                              "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                              isActive || isSelected
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent/50 hover:text-accent-foreground",
                            )}
                            onMouseEnter={() => handleHover(level, cat.id as number, hasChildren)}
                            onClick={() => {
                              onSelect(cat.id as number);
                              setOpen(false);
                            }}
                          >
                            <span className="flex items-center gap-2 truncate flex-1">
                              {cat.icon && <span>{cat.icon}</span>}
                              {cat.name}
                            </span>
                            {hasChildren ? (
                              <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                            ) : (
                              isSelected && <Check className="ml-auto h-4 w-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

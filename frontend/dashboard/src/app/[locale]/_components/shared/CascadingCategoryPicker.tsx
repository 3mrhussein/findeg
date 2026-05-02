"use client";

import * as React from "react";
import { ChevronRight, X, Loader2, Folder } from "lucide-react";
import { cn } from "@lib/utils";
import { Button } from "@findeg/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@findeg/ui";
import { ScrollArea } from "@findeg/ui";

export interface Category {
  id: number;
  parentId?: number;
  name: string;
  depth?: number;
  path?: string;
}

export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[];
}

interface CascadingCategoryPickerProps {
  value: number | null;
  onChange: (id: number | null) => void;
  categories: CategoryTreeNode[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CascadingCategoryPicker({
  value,
  onChange,
  categories,
  placeholder = "Select category...",
  disabled = false,
  className,
}: CascadingCategoryPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [activePath, setActivePath] = React.useState<number[]>([]);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Find the selected category and its ancestors for the trigger breadcrumb
  const selectedBreadcrumbs = React.useMemo(() => {
    if (!value) return null;

    const findPath = (
      id: number,
      nodes: CategoryTreeNode[],
      currentPath: CategoryTreeNode[] = [],
    ): CategoryTreeNode[] | null => {
      for (const node of nodes) {
        if (node.id === id) return [...currentPath, node];
        if (node.children) {
          const found = findPath(id, node.children, [...currentPath, node]);
          if (found) return found;
        }
      }
      return null;
    };

    return findPath(value, categories);
  }, [value, categories]);

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && selectedBreadcrumbs) {
      setActivePath(selectedBreadcrumbs.map((b) => b.id));
    } else if (!isOpen) {
      setActivePath([]);
    }
  };

  const handleMouseEnter = (node: CategoryTreeNode, columnIndex: number) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = setTimeout(() => {
      const newPath = activePath.slice(0, columnIndex);
      newPath[columnIndex] = node.id;
      setActivePath(newPath);
    }, 150);
  };

  const handleItemClick = (node: CategoryTreeNode) => {
    onChange(node.id);
    setOpen(false);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const renderColumn = (nodes: CategoryTreeNode[], depth: number) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <ScrollArea key={depth} className="h-[300px] w-[220px]">
        <div className="p-1">
          {nodes.map((node) => {
            const hasChildren = node.children && node.children.length > 0;
            const isActive = activePath[depth] === node.id;
            const isSelected = selectedBreadcrumbs?.some((b) => b.id === node.id);

            return (
              <div
                key={node.id}
                className={cn(
                  "flex h-9 cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                  isSelected && !isActive && "text-primary font-medium",
                )}
                onMouseEnter={() => handleMouseEnter(node, depth)}
                onClick={() => handleItemClick(node)}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className="h-4 w-4 shrink-0 opacity-50" />
                  <span className="truncate">{node.name}</span>
                </div>
                {hasChildren && <ChevronRight className="h-4 w-4 opacity-50" />}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  const columns = [categories];
  activePath.forEach((id, index) => {
    const parent = (index === 0 ? categories : columns[index])?.find((c) => c.id === id);
    if (parent?.children && parent.children.length > 0) {
      columns.push(parent.children);
    }
  });

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            "h-auto min-h-[40px] w-full justify-between gap-2 px-3 py-2 font-normal hover:bg-background",
            className,
          )}
        >
          <div className="flex flex-wrap items-center gap-1 overflow-hidden text-left">
            {selectedBreadcrumbs ? (
              selectedBreadcrumbs.map((b, i) => (
                <React.Fragment key={b.id}>
                  {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />}
                  <span className="truncate max-w-[120px]">{b.name}</span>
                </React.Fragment>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {value && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={clearSelection}
              />
            )}
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 rotate-90 opacity-50 transition-transform duration-200",
                open && "-rotate-90",
              )}
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[240px] p-0" align="start">
        <div className="flex overflow-hidden divide-x">
          {columns.map((nodes, i) => renderColumn(nodes, i))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

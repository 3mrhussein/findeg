/**
 * CategoryRow — Tree row component for hierarchical category display
 *
 * Features:
 * - Expandable/collapsible for categories with children
 * - Drag handle for reordering (same level)
 * - Folder/document icon based on children presence
 * - Status badge, product count
 * - Quick actions (Edit, Add Child, Delete)
 *
 * Location: src/app/[locale]/admin/(dashboard)/categories/_components/
 */

"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  GripVertical,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/catalog/domain/entities/Category";

interface CategoryRowProps {
  category: Category;
  depth: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  onEdit?: (category: Category) => void;
  onAddChild?: (parentId: number) => void;
  onDelete?: (category: Category) => void;
  /** Draggable ID for sortable */
  id: string;
}

/**
 * CategoryRow — Single tree row
 *
 * Displays category in tree hierarchy with expand/collapse,
 * drag handle, and quick actions.
 */
export function CategoryRow({
  category,
  depth,
  isExpanded = false,
  onToggle,
  onEdit,
  onAddChild,
  onDelete,
  id,
}: CategoryRowProps) {
  const hasChildren = (category.children?.length || 0) > 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate indent based on depth
  const indent = depth * 24; // 24px per level

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-2 rounded-md border bg-card px-3 py-2 hover:bg-accent/50 transition-colors",
        isDragging && "opacity-50 shadow-lg",
      )}
    >
      {/* Indent spacer */}
      <div style={{ width: `${indent}px` }} className="flex-shrink-0" />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Expand/Collapse Toggle */}
      {hasChildren ? (
        <button
          onClick={onToggle}
          className="flex-shrink-0 p-1 hover:bg-accent rounded transition-colors"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      ) : (
        <div className="w-6" /> // Spacer for alignment
      )}

      {/* Icon */}
      <div className="flex-shrink-0">
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-amber-500" />
          ) : (
            <Folder className="h-4 w-4 text-amber-500" />
          )
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{category.name}</span>
          {category.icon && (
            <span className="text-lg" title={`Icon: ${category.icon}`}>
              {category.icon}
            </span>
          )}
        </div>
        {isExpanded && category.slug && (
          <p className="text-xs text-muted-foreground mt-0.5">/{category.slug}</p>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex-shrink-0">
        <StatusBadge status={category.isActive ? "active" : "draft"} />
      </div>

      {/* Product Count (if expanded) */}
      {isExpanded && (
        <Badge variant="outline" className="flex-shrink-0 text-xs">
          0 products
        </Badge>
      )}

      {/* Quick Actions (visible on hover) */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onEdit?.(category)}
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onAddChild?.(category.id)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete?.(category)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

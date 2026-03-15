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
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/catalog/domain/entities/Category";

import { useTranslations } from "next-intl";

interface CategoryRowProps {
  category: Category;
  depth: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  onEdit?: (category: Category) => void;
  onAddChild?: (parentId: number) => void;
  onDelete?: (category: Category) => void;
  onMoveUp?: (id: number) => void;
  onMoveDown?: (id: number) => void;
  /** Draggable ID for sortable */
  id: string;
}

/**
 * CategoryRow — Single tree row
 */
export function CategoryRow({
  category,
  depth,
  isExpanded = false,
  onToggle,
  onEdit,
  onAddChild,
  onDelete,
  onMoveUp,
  onMoveDown,
  id,
}: CategoryRowProps) {
  const t = useTranslations("Administration.Catalog.Categories");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = (category.children?.length || 0) > 0;
  const indent = depth * 24;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-accent/50 transition-colors",
        hasChildren && depth === 0 && "bg-slate-200 dark:bg-slate-950/50 shadow-sm",
        hasChildren && depth === 1 && "bg-slate-100 dark:bg-slate-900/50",
        (!hasChildren || depth >= 2) && "bg-slate-50 dark:bg-slate-800/30",
        depth > 0 && "border-s-2 border-s-muted ml-4",
        isDragging && "opacity-50 shadow-lg z-50",
      )}
    >
      {/* Indent spacer */}
      <div style={{ width: `${indent > 0 ? indent - 16 : 0}px` }} className="shrink-0" />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Expand/Collapse Toggle */}
      <div className="shrink-0 w-6 flex justify-center">
        {hasChildren ? (
          <button onClick={onToggle} className="p-1 hover:bg-accent rounded transition-colors">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="h-4 w-4 rounded-full bg-muted/20" />
        )}
      </div>

      {/* Icon */}
      <div className="shrink-0">
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

      {/* Name & Slug */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium truncate">
            {category.localizedContent?.name?.en || category.name || category.slug}
          </span>
          {category.icon && (
            <Badge variant="secondary" className="px-1 py-0 h-5 text-xs font-normal">
              {category.icon}
            </Badge>
          )}
        </div>
        {category.slug && (
          <p className="text-[12px] text-gray-400 mt-0.5 leading-none">{category.slug}</p>
        )}
      </div>

      {/* Status Badge */}
      <div className="shrink-0">
        <StatusBadge status={category.isActive ? "active" : "draft"} />
      </div>

      {/* Product Count (Hidden if 0) */}
      {(category as any).productCount !== undefined && (category as any).productCount > 0 ? (
        <span className="shrink-0 text-[13px] text-gray-400 font-normal">
          {t("Form.ProductCount", { count: (category as any).productCount })}
        </span>
      ) : null}

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1 transition-opacity">
        <TooltipProvider delayDuration={300}>
          {/* Add Child */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onAddChild?.(category.id)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("Tree.AddSub")}</p>
            </TooltipContent>
          </Tooltip>

          {/* Move Up */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onMoveUp?.(category.id)}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("Tree.MoveUp")}</p>
            </TooltipContent>
          </Tooltip>

          {/* Move Down */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onMoveDown?.(category.id)}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("Tree.MoveDown")}</p>
            </TooltipContent>
          </Tooltip>

          {/* Edit */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit?.(category)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("Form.Edit") || "Edit"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => onDelete?.(category)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("DeleteCategory")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

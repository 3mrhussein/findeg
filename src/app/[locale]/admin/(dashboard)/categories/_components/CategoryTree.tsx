/**
 * CategoryTree — Hierarchical tree view with drag-to-reorder
 *
 * Features:
 * - Recursive rendering of category hierarchy
 * - Drag-and-drop reordering within same level (@dnd-kit)
 * - Expand/collapse categories with children
 * - Quick actions (Edit, Add Child, Delete)
 * - "Add Category" button
 *
 * Location: src/app/[locale]/admin/(dashboard)/categories/_components/
 */

"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryRow } from "./CategoryRow";
import { CategoryDrawer } from "./CategoryDrawer";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Category } from "@/features/catalog/domain/entities/Category";

interface CategoryTreeProps {
  categories: Category[];
  onReorder?: (reorderedCategories: Category[]) => Promise<void>;
  onSave?: (data: any, categoryId?: number) => Promise<void>;
  onDelete?: (categoryId: number) => Promise<void>;
}

/**
 * CategoryTree — Complete tree view with CRUD
 *
 * @example
 * <CategoryTree
 *   categories={categories}
 *   onReorder={handleReorder}
 *   onSave={handleSave}
 *   onDelete={handleDelete}
 * />
 */
export function CategoryTree({ categories, onReorder, onSave, onDelete }: CategoryTreeProps) {
  const [items, setItems] = React.useState<Category[]>(categories);
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(new Set());
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [parentIdForNew, setParentIdForNew] = React.useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Update items when categories prop changes
  React.useEffect(() => {
    setItems(categories);
  }, [categories]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => String(item.id) === active.id);
    const newIndex = items.findIndex((item) => String(item.id) === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    // Call onReorder callback
    if (onReorder) {
      await onReorder(reordered);
    }
  };

  const toggleExpand = (categoryId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setParentIdForNew(null);
    setDrawerOpen(true);
  };

  const handleAddChild = (parentId: number) => {
    setSelectedCategory(null);
    setParentIdForNew(parentId);
    setDrawerOpen(true);
  };

  const handleAddRoot = () => {
    setSelectedCategory(null);
    setParentIdForNew(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (onDelete) {
      await onDelete(category.id);
    }
  };

  const handleDrawerSubmit = async (data: any) => {
    if (onSave) {
      const categoryId = selectedCategory?.id;
      const dataWithParent = {
        ...data,
        parentId: parentIdForNew || data.parentId,
      };
      await onSave(dataWithParent, categoryId);
    }
    setDrawerOpen(false);
    setSelectedCategory(null);
    setParentIdForNew(null);
  };

  const handleDrawerDelete = async (categoryId: number) => {
    if (onDelete) {
      await onDelete(categoryId);
    }
  };

  // Recursive render function
  const renderCategory = (category: Category, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedIds.has(category.id);
    const hasChildren = (category.children?.length || 0) > 0;

    return (
      <React.Fragment key={category.id}>
        <CategoryRow
          id={String(category.id)}
          category={category}
          depth={depth}
          isExpanded={isExpanded}
          onToggle={() => toggleExpand(category.id)}
          onEdit={handleEdit}
          onAddChild={handleAddChild}
          onDelete={handleDelete}
        />

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="space-y-1 mt-1">
            {category.children!.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  if (items.length === 0) {
    return (
      <>
        <EmptyState
          title="No categories yet"
          description="Create your first product category to organize your catalog."
          action={{
            label: "Add Category",
            onClick: handleAddRoot,
          }}
        />

        <CategoryDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          category={selectedCategory}
          categories={items}
          onSubmit={handleDrawerSubmit}
          onDelete={onDelete ? handleDrawerDelete : undefined}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Add Category Button */}
        <div className="flex justify-end">
          <Button onClick={handleAddRoot}>
            <Plus className="h-4 w-4 me-2" />
            Add Category
          </Button>
        </div>

        {/* Tree */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={items.map((item) => String(item.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">{items.map((category) => renderCategory(category, 0))}</div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Category Drawer (Create/Edit) */}
      <CategoryDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCategory(null);
          setParentIdForNew(null);
        }}
        category={selectedCategory}
        categories={items}
        onSubmit={handleDrawerSubmit}
        onDelete={onDelete ? handleDrawerDelete : undefined}
      />
    </>
  );
}

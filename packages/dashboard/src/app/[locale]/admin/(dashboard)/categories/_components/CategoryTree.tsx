/**
 * CategoryTree — Hierarchical tree view with drag-to-reorder
 *
 * Features:
 * - Recursive rendering of category hierarchy
 * - Drag-and-drop reordering within same level (@dnd-kit)
 * - Expand/collapse categories with children
 * - Quick actions: Edit, Add Child, Move Up/Down, Delete
 * - 3-column layout on lg+: tree + inline form panel
 * - Sheet/drawer on mobile (sm/md)
 * - Search with localized name matching
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
import { Button } from "@findeg/ui";
import { Input } from "@findeg/ui";
import { Plus, Search } from "lucide-react";
import { CategoryRow } from "./CategoryRow";
import { CategoryFormPanel } from "./CategoryFormPanel";
import { CategoryDrawer } from "./CategoryDrawer";
import { EmptyState } from "@findeg/ui";
import { checkCategorySlugAvailableAction as checkSlugAvailableAction } from "@/actions/admin-actions";
import type { Category } from "@/features/catalog/domain/entities/Category";
import { useTranslations } from "next-intl";
import { moveCategoryUpAction, moveCategoryDownAction } from "@/actions/admin-actions";

import { ConfirmDialog } from "@/app/[locale]/admin/_components/shared/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@findeg/ui";
import { cn } from "@/lib/utils";

interface CategoryTreeProps {
  categories: Category[];
  onReorder?: (reorderedCategories: Category[]) => Promise<void>;
  onSave?: (data: any, categoryId?: number) => Promise<void>;
  onDelete?: (categoryId: number) => Promise<void>;
}

/** Detect if we're on a large screen (≥1024px) to switch between inline panel and drawer */
function useIsLargeScreen() {
  const [isLarge, setIsLarge] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLarge(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLarge(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isLarge;
}

export function CategoryTree({ categories, onReorder, onSave, onDelete }: CategoryTreeProps) {
  const t = useTranslations("Administration.Catalog.Categories");
  const isLargeScreen = useIsLargeScreen();

  // Tree state
  const [items, setItems] = React.useState<Category[]>(categories);
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");

  // Panel state — which category (or null = create) is open
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [parentIdForNew, setParentIdForNew] = React.useState<number | null>(null);

  // Delete dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(null);
  const [showBlockedDialog, setShowBlockedDialog] = React.useState(false);
  const [blockedMessage, setBlockedMessage] = React.useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  React.useEffect(() => {
    setItems(categories);
  }, [categories]);

  // Search filter — matches localizedName.en or slug, keeps ancestors visible
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    const filterFn = (cat: Category): Category | null => {
      const displayName = cat.localizedContent?.name?.en ?? cat.slug;
      const match =
        displayName.toLowerCase().includes(query) || cat.slug.toLowerCase().includes(query);
      const filteredChildren = (cat.children ?? [])
        .map(filterFn)
        .filter((c): c is Category => c !== null);
      if (match || filteredChildren.length > 0) return { ...cat, children: filteredChildren };
      return null;
    };
    return items.map(filterFn).filter((c): c is Category => c !== null);
  }, [items, searchQuery]);

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => String(item.id) === active.id);
    const newIndex = items.findIndex((item) => String(item.id) === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(items, oldIndex, newIndex);
      setItems(reordered);
      if (onReorder) await onReorder(reordered);
      return;
    }

    const findAndMove = (list: Category[]): boolean => {
      const aIdx = list.findIndex((i) => String(i.id) === active.id);
      const oIdx = list.findIndex((i) => String(i.id) === over.id);
      if (aIdx !== -1 && oIdx !== -1) {
        if (onReorder) onReorder(arrayMove(list, aIdx, oIdx));
        return true;
      }
      for (const item of list) {
        if (item.children && findAndMove(item.children)) return true;
      }
      return false;
    };
    findAndMove(items);
  };

  // ── Move Up/Down ──────────────────────────────────────────────────────────
  const handleMoveUp = async (id: number) => {
    const res = await moveCategoryUpAction(id);
    if (!res.success) console.error(res.error);
  };
  const handleMoveDown = async (id: number) => {
    const res = await moveCategoryDownAction(id);
    if (!res.success) console.error(res.error);
  };

  // ── Panel open/close ──────────────────────────────────────────────────────
  const openCreate = () => {
    setSelectedCategory(null);
    setParentIdForNew(null);
    setPanelOpen(true);
  };
  const openEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setParentIdForNew(null);
    setPanelOpen(true);
  };
  const openAddChild = (parentId: number) => {
    setSelectedCategory(null);
    setParentIdForNew(parentId);
    setPanelOpen(true);
  };
  const closePanel = () => {
    setPanelOpen(false);
    setSelectedCategory(null);
    setParentIdForNew(null);
  };

  // ── Expand/collapse ───────────────────────────────────────────────────────
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (cat: Category) => {
    if (cat.children && cat.children.length > 0) {
      setBlockedMessage("This category has sub-categories. Please delete or move them first.");
      setShowBlockedDialog(true);
      return;
    }
    setCategoryToDelete(cat);
    setShowDeleteConfirm(true);
  };
  const handleConfirmDelete = async () => {
    if (categoryToDelete && onDelete) await onDelete(categoryToDelete.id);
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: any) => {
    if (onSave) {
      await onSave(
        { ...data, parentId: data.parentId === 0 ? null : data.parentId },
        selectedCategory?.id,
      );
    }
    closePanel();
  };

  // ── Recursive render ──────────────────────────────────────────────────────
  const renderCategory = (cat: Category, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedIds.has(cat.id) || searchQuery.length > 0;
    const hasChildren = (cat.children?.length || 0) > 0;
    const isSelectedForEdit = panelOpen && selectedCategory?.id === cat.id;
    const isParentSelected = panelOpen && !selectedCategory && parentIdForNew === cat.id;

    return (
      <React.Fragment key={cat.id}>
        <div
          className={cn(
            "transition-colors",
            (isSelectedForEdit || isParentSelected) &&
              "ring-1 ring-inset ring-indigo-400 rounded-md bg-indigo-50 dark:bg-indigo-950/30",
          )}
        >
          <CategoryRow
            id={String(cat.id)}
            category={cat}
            depth={depth}
            isExpanded={isExpanded}
            onToggle={() => toggleExpand(cat.id)}
            onEdit={openEdit}
            onAddChild={openAddChild}
            onDelete={handleDelete}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        </div>

        {isExpanded && hasChildren && (
          <SortableContext
            items={cat.children!.map((c) => String(c.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1 mt-1">
              {cat.children!.map((child) => renderCategory(child, depth + 1))}
            </div>
          </SortableContext>
        )}
      </React.Fragment>
    );
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <>
        <EmptyState
          title={t("Tree.Empty")}
          description={t("Subtitle", { count: 0 })}
          action={{ label: t("AddCategory"), onClick: openCreate }}
        />
        {/* Mobile drawer — always rendered */}
        <div className="lg:hidden">
          <CategoryDrawer
            open={panelOpen && !isLargeScreen}
            onClose={closePanel}
            category={selectedCategory}
            initialParentId={parentIdForNew}
            categories={items}
            onSubmit={handleFormSubmit}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {/* ── 3-Column Layout ─────────────────────────────────── */}
      <div className={cn("relative flex gap-0", "transition-all duration-300")}>
        {/* Column 2: Tree */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Tree.SearchPlaceholder")}
                className="pl-9 h-10 rounded-lg border-gray-200 dark:border-border focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 me-2" />
              {t("AddCategory")}
            </Button>
          </div>

          {/* Tree rows */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredCategories.map((item) => String(item.id))}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {filteredCategories.map((cat) => renderCategory(cat, 0))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Column 3: Form Panel — lg+ only, inline */}
        <div
          className={cn(
            "hidden lg:flex flex-col",
            "shrink-0",
            "border rounded-xl overflow-hidden",
            "bg-white dark:bg-card border-gray-200 dark:border-border",
            "sticky top-6 self-start",
            "transition-all duration-300 ease-in-out",
            panelOpen
              ? "w-[420px] opacity-100 translate-x-0 ms-6"
              : "w-0 opacity-0 pointer-events-none translate-x-8 ms-0 border-0",
            "h-[calc(100vh-160px)]",
          )}
        >
          {panelOpen && (
            <CategoryFormPanel
              category={selectedCategory}
              initialParentId={parentIdForNew}
              categories={items}
              onSubmit={handleFormSubmit}
              onClose={closePanel}
            />
          )}
        </div>
      </div>

      {/* Mobile drawer (< lg) */}
      <div className="lg:hidden">
        <CategoryDrawer
          open={panelOpen && !isLargeScreen}
          onClose={closePanel}
          category={selectedCategory}
          initialParentId={parentIdForNew}
          categories={items}
          onSubmit={handleFormSubmit}
        />
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title={t("DeleteConfirmTitle")}
        description={t("DeleteConfirmDescription", {
          name: categoryToDelete?.localizedContent?.name?.en ?? categoryToDelete?.slug ?? "",
        })}
        confirmLabel={t("DeleteCategory")}
        variant="destructive"
      />

      {/* Blocked delete dialog (informational — single OK button) */}
      <Dialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Tree.DeleteBlockedTitle")}</DialogTitle>
            <DialogDescription>{blockedMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowBlockedDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

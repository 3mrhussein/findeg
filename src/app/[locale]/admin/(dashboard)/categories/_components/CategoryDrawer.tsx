/**
 * CategoryDrawer — Slide-over form for creating/editing categories
 *
 * Features:
 * - Bilingual name input (EN/AR)
 * - Auto-generated slug (editable)
 * - Parent category dropdown
 * - Icon picker (emoji)
 * - Sort order input
 * - Status toggle
 * - Delete button (edit mode only)
 *
 * Location: src/app/[locale]/admin/(dashboard)/categories/_components/
 */

"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { SlideOver } from "@/app/[locale]/admin/_components/shared/SlideOver";
import { ConfirmDialog } from "@/app/[locale]/admin/_components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BilingualInput } from "@/components/shared/BilingualInput";
import { BilingualTextarea } from "@/components/shared/BilingualTextarea";
import { Separator } from "@/components/ui/separator";
import { Save, Trash2 } from "lucide-react";
import type { Category } from "@/features/catalog/domain/entities/Category";

interface CategoryFormValues {
  localizedName: {
    en: string;
    ar: string;
  };
  localizedDescription: {
    en?: string;
    ar?: string;
  };
  parentId: number | null;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

interface CategoryDrawerProps {
  /** Is drawer open? */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Category to edit (null for create mode) */
  category?: Category | null;
  /** Available parent categories */
  categories: Category[];
  /** Submit handler */
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  /** Delete handler (edit mode only) */
  onDelete?: (categoryId: number) => Promise<void>;
}

/**
 * CategoryDrawer — Form drawer for category CRUD
 *
 * @example
 * <CategoryDrawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   category={selectedCategory}
 *   categories={allCategories}
 *   onSubmit={handleSave}
 *   onDelete={handleDelete}
 * />
 */
export function CategoryDrawer({
  open,
  onClose,
  category,
  categories,
  onSubmit,
  onDelete,
}: CategoryDrawerProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const isEditMode = !!category;

  const methods = useForm<CategoryFormValues>({
    defaultValues: {
      localizedName: {
        en: category?.localizedContent?.name?.en || category?.name || "",
        ar: category?.localizedContent?.name?.ar || "",
      },
      localizedDescription: {
        en: category?.localizedContent?.description?.en || category?.description || "",
        ar: category?.localizedContent?.description?.ar || "",
      },
      parentId: category?.parentId || null,
      icon: category?.icon || "",
      sortOrder: category?.sortOrder || 0,
      isActive: category?.isActive ?? true,
    },
  });

  const { register, watch, setValue, handleSubmit, reset } = methods;

  // Reset form when category changes
  React.useEffect(() => {
    if (open) {
      reset({
        localizedName: {
          en: category?.localizedContent?.name?.en || category?.name || "",
          ar: category?.localizedContent?.name?.ar || "",
        },
        localizedDescription: {
          en: category?.localizedContent?.description?.en || category?.description || "",
          ar: category?.localizedContent?.description?.ar || "",
        },
        parentId: category?.parentId || null,
        icon: category?.icon || "",
        sortOrder: category?.sortOrder || 0,
        isActive: category?.isActive ?? true,
      });
    }
  }, [category, open, reset]);

  const handleFormSubmit = async (data: CategoryFormValues) => {
    setIsSaving(true);
    try {
      await onSubmit(data);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category || !onDelete) return;
    setIsSaving(true);
    try {
      await onDelete(category.id);
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const isActive = watch("isActive");
  const parentId = watch("parentId");

  return (
    <>
      <SlideOver
        open={open}
        onOpenChange={(isOpen) => !isOpen && onClose()}
        title={isEditMode ? `Edit: ${category.name}` : "New Category"}
        description={isEditMode ? "Update category details" : "Create a new product category"}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Name (Bilingual) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category Name *</Label>
                <BilingualInput
                  nameEn="localizedName.en"
                  nameAr="localizedName.ar"
                  placeholderEn="e.g. Office Supplies"
                  placeholderAr="مثال: لوازم مكتبية"
                  required
                />
              </div>

              <Separator />

              {/* Description (Bilingual) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <BilingualTextarea
                  nameEn="localizedDescription.en"
                  nameAr="localizedDescription.ar"
                  placeholderEn="Category description..."
                  placeholderAr="وصف الفئة..."
                  rows={3}
                />
              </div>

              <Separator />

              {/* Parent Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Parent Category</Label>
                <Select
                  value={parentId != null ? String(parentId) : "none"}
                  onValueChange={(v) => setValue("parentId", v === "none" ? null : Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (top level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top level)</SelectItem>
                    {categories
                      .filter((c) => c.id !== category?.id) // Don't allow self as parent
                      .map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Icon (Emoji) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Icon (Emoji)</Label>
                <Input {...register("icon")} placeholder="📁" maxLength={2} className="text-2xl" />
                <p className="text-xs text-muted-foreground">Optional emoji icon for category</p>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort Order</Label>
                <Input
                  type="number"
                  {...register("sortOrder", { valueAsNumber: true })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
              </div>

              <Separator />

              {/* Status Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-xs text-muted-foreground">
                    {isActive ? "Visible in storefront" : "Hidden from customers"}
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex-shrink-0 border-t bg-muted/30 px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                {/* Delete Button (Edit Mode Only) */}
                {isEditMode && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    Delete
                  </Button>
                )}

                <div className="flex-1" />

                {/* Cancel & Save */}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save className="h-4 w-4 me-2" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </SlideOver>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${category?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}

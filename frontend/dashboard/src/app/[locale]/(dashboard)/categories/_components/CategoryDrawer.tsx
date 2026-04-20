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
import { SlideOver } from "@/app/[locale]/_components/shared/SlideOver";
import { ConfirmDialog } from "@/app/[locale]/_components/shared/ConfirmDialog";
import { Button } from "@findeg/ui";
import { Input } from "@findeg/ui";
import { Label } from "@findeg/ui";
import { Switch } from "@findeg/ui";
import { CollapsibleCategoryPicker } from "@/app/[locale]/_components/shared/CollapsibleCategoryPicker";
import { BilingualInput } from "@components/shared/BilingualInput";
import { BilingualTextarea } from "@components/shared/BilingualTextarea";
import { Separator } from "@findeg/ui";
import { Save, Trash2, Check, AlertCircle, Loader2 } from "lucide-react";
import type { Category } from "@findeg/backend/features/catalog";
import { useTranslations } from "next-intl";
import { checkCategorySlugAvailableAction as checkSlugAvailableAction } from "@actions/admin-actions";

import { cn } from "@lib/utils";

interface CategoryFormValues {
  localizedName: {
    en: string;
    ar: string;
  };
  localizedDescription: {
    en?: string;
    ar?: string;
  };
  slug: string;
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
  /** Initial parent ID for new category */
  initialParentId?: number | null;
  /** Available parent categories */
  categories: Category[];
  /** Submit handler */
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  /** Delete handler (edit mode only) */
  onDelete?: (categoryId: number) => Promise<void>;
}

/**
 * CategoryDrawer — Form drawer for category CRUD
 */
export function CategoryDrawer({
  open,
  onClose,
  category,
  initialParentId,
  categories,
  onSubmit,
  onDelete,
}: CategoryDrawerProps) {
  const t = useTranslations("Administration.Catalog.Categories");
  const commonT = useTranslations("Common");
  const [isSaving, setIsSaving] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = React.useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = React.useState(false);
  const isEditMode = !!category;

  const methods = useForm<CategoryFormValues>({
    defaultValues: {
      localizedName: {
        en: category?.localizedContent?.name?.en || "",
        ar: category?.localizedContent?.name?.ar || "",
      },
      localizedDescription: {
        en: category?.localizedContent?.description?.en || "",
        ar: category?.localizedContent?.description?.ar || "",
      },
      slug: category?.slug || "",
      parentId: category?.parentId || initialParentId || null,
      icon: category?.icon || "",
      sortOrder: category?.sortOrder || 0,
      isActive: category?.isActive ?? true,
    },
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  // Reset form when category or initialParentId changes
  React.useEffect(() => {
    if (open) {
      reset({
        localizedName: {
          en: category?.localizedContent?.name?.en || "",
          ar: category?.localizedContent?.name?.ar || "",
        },
        localizedDescription: {
          en: category?.localizedContent?.description?.en || "",
          ar: category?.localizedContent?.description?.ar || "",
        },
        slug: category?.slug || "",
        parentId: category?.parentId || initialParentId || null,
        icon: category?.icon || "",
        sortOrder: category?.sortOrder || 0,
        isActive: category?.isActive ?? true,
      });
      setIsSlugAvailable(null);
    }
  }, [category, initialParentId, open, reset]);

  // Slug auto-generation logic
  const nameEn = watch("localizedName.en");
  const currentSlug = watch("slug");

  const prevNameRef = React.useRef("");
  React.useEffect(() => {
    if (!isEditMode && nameEn) {
      const generated = nameEn
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      // Auto-update slug if it's empty, or still matches the previously auto-generated value
      const prevGenerated = prevNameRef.current
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (!currentSlug || currentSlug === prevGenerated) {
        setValue("slug", generated, { shouldValidate: true });
      }
      prevNameRef.current = nameEn;
    }
  }, [nameEn, isEditMode, setValue, currentSlug]);

  // Slug availability check
  React.useEffect(() => {
    const checkSlug = async () => {
      if (!currentSlug || currentSlug.length < 3) {
        setIsSlugAvailable(null);
        return;
      }
      setIsCheckingSlug(true);
      try {
        const result = await checkSlugAvailableAction(currentSlug, category?.id);
        if (result.success) {
          setIsSlugAvailable(result.available ?? false);
        }
      } finally {
        setIsCheckingSlug(false);
      }
    };

    const timer = setTimeout(checkSlug, 500);
    return () => clearTimeout(timer);
  }, [currentSlug, category?.id]);

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
        title={isEditMode ? t("EditCategory") : t("NewCategory")}
        description={isEditMode ? t("Form.ProductCount", { count: 0 }) : undefined}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Name (Bilingual) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Form.NameEn")} *</Label>
                <BilingualInput
                  nameEn="localizedName.en"
                  nameAr="localizedName.ar"
                  placeholderEn={t("Form.SlugPlaceholder")}
                  placeholderAr={t("Form.NameAr")}
                  required
                />
                {errors.localizedName?.en && (
                  <p className="text-xs text-destructive">{errors.localizedName.en.message}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">{t("Form.Slug")} *</Label>
                  {isCheckingSlug ? (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  ) : isSlugAvailable === true ? (
                    <span className="text-[10px] text-green-600 flex items-center gap-0.5 font-medium">
                      <Check className="h-2.5 w-2.5" /> Available
                    </span>
                  ) : isSlugAvailable === false ? (
                    <span className="text-[10px] text-destructive flex items-center gap-0.5 font-medium">
                      <AlertCircle className="h-2.5 w-2.5" /> Taken
                    </span>
                  ) : null}
                </div>
                <Input
                  {...register("slug", { required: true })}
                  placeholder={t("Form.SlugPlaceholder")}
                  className={cn(
                    isSlugAvailable === true && "border-green-500 focus-visible:ring-green-500",
                    isSlugAvailable === false &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <p className="text-xs text-muted-foreground">{t("Form.SlugHint")}</p>
              </div>

              <Separator />

              {/* Description (Bilingual) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Form.DescriptionEn")}</Label>
                <BilingualTextarea
                  nameEn="localizedDescription.en"
                  nameAr="localizedDescription.ar"
                  placeholderEn={t("Form.DescriptionEn")}
                  placeholderAr={t("Form.DescriptionAr")}
                  rows={3}
                />
              </div>

              <Separator />

              {/* Parent Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Form.Parent")}</Label>
                <CollapsibleCategoryPicker
                  categories={categories.filter((c) => c.id !== category?.id)} // Don't allow self as parent
                  selectedId={parentId}
                  onSelect={(id) => setValue("parentId", id === 0 ? null : id)}
                  placeholder={t("Form.ParentNone")}
                />
              </div>

              {/* Icon (Lucide name or Emoji) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Form.Icon")}</Label>
                <Input
                  {...register("icon")}
                  placeholder={t("Form.IconPlaceholder")}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">{t("Form.IconHint")}</p>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Form.DisplayOrder")}</Label>
                <Input
                  type="number"
                  {...register("sortOrder", { valueAsNumber: true })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">{t("Form.DisplayOrderHint")}</p>
              </div>

              <Separator />

              {/* Status Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{t("Form.IsActive")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {isActive ? t("Form.IsActive") : t("Form.IsActiveHint")}
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="shrink-0 border-t bg-muted/30 px-6 py-4">
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
                    {t("DeleteCategory")}
                  </Button>
                )}

                <div className="flex-1" />

                {/* Cancel & Save */}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                    {commonT("Cancel")}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save className="h-4 w-4 me-2" />
                    {isSaving ? commonT("Loading") : commonT("Save")}
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
        title={t("DeleteConfirmTitle")}
        description={t("DeleteConfirmDescription", {
          name: category?.localizedContent?.name?.en ?? category?.slug ?? "",
        })}
        confirmLabel={t("DeleteCategory")}
        variant="destructive"
      />
    </>
  );
}

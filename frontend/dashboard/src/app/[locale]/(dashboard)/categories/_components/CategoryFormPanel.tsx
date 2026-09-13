/**
 * CategoryFormPanel — Inline form panel for creating/editing categories
 *
 * Used in the 3-column layout on large screens.
 * Replaces the Sheet/drawer for lg+ viewports.
 *
 * Features:
 * - Sticky header and footer
 * - Bilingual name inputs (stacked, not side-by-side)
 * - Auto-generated slug with availability check
 * - Collapsible parent category picker
 * - Status toggle
 * - Translate via next-intl
 *
 * Location: src/app/[locale]/admin/(dashboard)/categories/_components/
 */

'use client';

import * as React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Input } from '@findeg/ui';
import { Label } from '@findeg/ui';
import { Switch } from '@findeg/ui';
import { Button } from '@findeg/ui';
import { Textarea } from '@findeg/ui';
import { CollapsibleCategoryPicker } from '@/app/[locale]/_components/shared/CollapsibleCategoryPicker';
import { Save, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import type { Category } from '@findeg/backend/features/catalog';
import { useTranslations } from 'next-intl';
import { checkCategorySlugAvailableAction as checkSlugAvailableAction } from '@data/categories/actions';

import { cn } from '@lib/utils';

interface CategoryFormValues {
  localizedName: { en: string; ar: string };
  localizedDescription: { en?: string; ar?: string };
  slug: string;
  parentId: number | null;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

interface CategoryFormPanelProps {
  /** Category to edit — null means create mode */
  category?: Category | null;
  /** Initial parent ID (for "Add child" flow) */
  initialParentId?: number | null;
  /** All categories for parent picker */
  categories: Category[];
  /** Submit handler */
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  /** Close handler */
  onClose: () => void;
}

export function CategoryFormPanel({
  category,
  initialParentId,
  categories,
  onSubmit,
  onClose,
}: CategoryFormPanelProps) {
  const t = useTranslations('Administration.Catalog.Categories');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = React.useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = React.useState(false);
  const isEditMode = !!category;

  const methods = useForm<CategoryFormValues>({
    defaultValues: {
      localizedName: {
        en: category?.localizedContent?.name?.en || '',
        ar: category?.localizedContent?.name?.ar || '',
      },
      localizedDescription: {
        en: category?.localizedContent?.description?.en || '',
        ar: category?.localizedContent?.description?.ar || '',
      },
      slug: category?.slug || '',
      parentId: category?.parentId || initialParentId || null,
      icon: category?.icon || '',
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
    control,
    formState: { errors },
  } = methods;

  // Reset form when the selected category changes
  React.useEffect(() => {
    reset({
      localizedName: {
        en: category?.localizedContent?.name?.en || '',
        ar: category?.localizedContent?.name?.ar || '',
      },
      localizedDescription: {
        en: category?.localizedContent?.description?.en || '',
        ar: category?.localizedContent?.description?.ar || '',
      },
      slug: category?.slug || '',
      parentId: category?.parentId || initialParentId || null,
      icon: category?.icon || '',
      sortOrder: category?.sortOrder || 0,
      isActive: category?.isActive ?? true,
    });
    setIsSlugAvailable(null);
  }, [category, initialParentId, reset]);

  // Slug auto-generation
  const nameEn = watch('localizedName.en');
  const currentSlug = watch('slug');
  const prevNameRef = React.useRef('');

  React.useEffect(() => {
    if (!isEditMode && nameEn) {
      const generated = nameEn
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const prevGenerated = prevNameRef.current
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!currentSlug || currentSlug === prevGenerated) {
        setValue('slug', generated, { shouldValidate: true });
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
        if (result.success) setIsSlugAvailable(result.available ?? false);
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
    } finally {
      setIsSaving(false);
    }
  };

  const isActive = watch('isActive');
  const parentId = watch('parentId');
  const nameEnValue = watch('localizedName.en');
  const nameArValue = watch('localizedName.ar');

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col h-full bg-white dark:bg-card"
      >
        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-border bg-white dark:bg-card">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-foreground">
            {isEditMode ? t('EditCategory') : t('NewCategory')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── BODY ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* English Name */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-foreground">
              {t('Form.NameEn')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                {...register('localizedName.en', { required: 'English name is required' })}
                placeholder="e.g. Writing Instruments"
                className={cn(
                  'h-10 rounded-lg border-gray-200 dark:border-border focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30',
                  errors.localizedName?.en &&
                    'border-red-400 focus:border-red-400 focus:ring-red-100',
                )}
              />
              {nameEnValue && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                  {nameEnValue.length}
                </span>
              )}
            </div>
            {errors.localizedName?.en && (
              <p className="text-[12px] text-red-500 mt-1">{errors.localizedName.en.message}</p>
            )}
          </div>

          {/* Arabic Name */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-foreground">
              {t('Form.NameAr')}
            </Label>
            <div className="relative">
              <Input
                {...register('localizedName.ar')}
                dir="rtl"
                placeholder="مثال: أدوات الكتابة"
                className={cn(
                  'h-10 rounded-lg border-gray-200 dark:border-border text-right focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30',
                )}
              />
              {nameArValue && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                  {nameArValue.length}
                </span>
              )}
            </div>
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-medium text-gray-700 dark:text-foreground">
                {t('Form.Slug')} <span className="text-red-500">*</span>
              </Label>
              {isCheckingSlug ? (
                <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              ) : isSlugAvailable === true ? (
                <span className="text-[11px] text-green-600 flex items-center gap-0.5 font-medium">
                  <Check className="h-2.5 w-2.5" /> Available
                </span>
              ) : isSlugAvailable === false ? (
                <span className="text-[11px] text-red-500 flex items-center gap-0.5 font-medium">
                  <AlertCircle className="h-2.5 w-2.5" /> Taken
                </span>
              ) : null}
            </div>
            <Input
              {...register('slug', { required: 'Slug is required' })}
              placeholder={t('Form.SlugPlaceholder')}
              className={cn(
                'h-10 rounded-lg border-gray-200 dark:border-border font-mono text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
                isSlugAvailable === true &&
                  'border-green-400 focus:border-green-400 focus:ring-green-100',
                isSlugAvailable === false &&
                  'border-red-400 focus:border-red-400 focus:ring-red-100',
                errors.slug && 'border-red-400 focus:border-red-400 focus:ring-red-100',
              )}
            />
            <p className="text-[11px] text-gray-400">{t('Form.SlugHint')}</p>
            {errors.slug && <p className="text-[12px] text-red-500">{errors.slug.message}</p>}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-border" />

          {/* English Description */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-foreground">
              {t('Form.DescriptionEn')}
            </Label>
            <Textarea
              {...register('localizedDescription.en')}
              placeholder="Optional description in English"
              rows={2}
              className="rounded-lg border-gray-200 dark:border-border resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Arabic Description */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-foreground">
              {t('Form.DescriptionAr')}
            </Label>
            <Textarea
              {...register('localizedDescription.ar')}
              dir="rtl"
              placeholder="وصف اختياري بالعربية"
              rows={2}
              className="rounded-lg border-gray-200 dark:border-border resize-none text-right focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-border" />

          {/* Parent Category */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-foreground">
              {t('Form.Parent')}
            </Label>
            <CollapsibleCategoryPicker
              categories={categories.filter((c) => c.id !== category?.id)}
              selectedId={parentId}
              onSelect={(id) => setValue('parentId', id === 0 ? null : id)}
              placeholder={t('Form.ParentNone')}
            />
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-foreground">
              {t('Form.Icon')}
            </Label>
            <Input
              {...register('icon')}
              placeholder={t('Form.IconPlaceholder')}
              maxLength={20}
              className="h-10 rounded-lg border-gray-200 dark:border-border focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-[11px] text-gray-400">{t('Form.IconHint')}</p>
          </div>

          {/* Display Order */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-gray-700 dark:text-foreground">
              {t('Form.DisplayOrder')}
            </Label>
            <Input
              type="number"
              {...register('sortOrder', { valueAsNumber: true })}
              placeholder="0"
              className="h-10 rounded-lg border-gray-200 dark:border-border focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-[11px] text-gray-400">{t('Form.DisplayOrderHint')}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-border" />

          {/* Is Active */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-gray-700 dark:text-foreground">
                {t('Form.IsActive')}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{t('Form.IsActiveHint')}</p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-gray-200 dark:border-border bg-gray-50 dark:bg-muted/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 me-2" />
                  {t('SaveSuccess').includes('saved') ? 'Save Category' : t('EditCategory')}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

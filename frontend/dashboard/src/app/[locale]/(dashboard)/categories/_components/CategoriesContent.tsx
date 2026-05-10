import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getCategories } from '@data/categories/queries';
import { parse, type Locale } from '@findeg/backend/features/core';
import { CategoryTree } from './CategoryTree';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
} from '@data/categories/actions';
import { revalidatePath } from 'next/cache';

interface CategoriesContentProps {
  locale: string;
}

/**
 * CategoriesContent - Handles data fetching and tree rendering.
 * Separated to allow streaming with Suspense.
 */
export async function CategoriesContent({ locale }: CategoriesContentProps) {
  const t = await getTranslations('Administration.Catalog.Categories');
  const resolvedLocale = parse(locale);

  // Fetch categories using data layer (with "use cache")
  const categories = await getCategories(resolvedLocale);

  // Server action for creating/updating categories
  async function handleSaveCategory(data: any, categoryId?: number) {
    'use server';

    const input = {
      name: data.localizedName || { en: 'Untitled', ar: '' },
      slug:
        data.slug ||
        (data.localizedName?.en ?? 'untitled')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      description: data.localizedDescription,
      parentId: data.parentId || null,
      icon: data.icon,
      isActive: data.isActive !== undefined ? data.isActive : true,
      translations: [
        {
          language: 'en',
          name: data.localizedName?.en || 'Untitled',
          description: data.localizedDescription?.en || '',
        },
        {
          language: 'ar',
          name: data.localizedName?.ar || '',
          description: data.localizedDescription?.ar || '',
        },
      ],
    };

    if (categoryId) {
      // Update existing category
      const result = await updateCategoryAction(categoryId, input as any);
      if (!result.success) {
        console.error('Update failed:', result.error);
        return;
      }
    } else {
      // Create new category
      const result = await createCategoryAction(input as any);
      if (!result.success) {
        console.error('Create failed:', result.error);
        return;
      }
    }

    revalidatePath(`/${locale}/categories`);
  }

  // Server action for deleting categories
  async function handleDeleteCategory(categoryId: number) {
    'use server';

    const result = await deleteCategoryAction(categoryId);
    if (!result.success) {
      console.error('Delete failed:', result.error);
      return;
    }

    revalidatePath(`/${locale}/categories`);
  }

  // Server action for reordering categories
  async function handleReorderCategories(reorderedCategories: any[]) {
    'use server';

    // Call the dedicated transaction route
    const items = reorderedCategories.map((c, i) => ({ id: c.id, sortOrder: i }));
    const result = await reorderCategoriesAction(items);

    if (!result.success) {
      console.error('Reorder failed:', result.error);
      return;
    }

    revalidatePath(`/${locale}/categories`);
  }

  return (
    <>
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {t('Title')}
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          {t('Subtitle', { count: categories.length })}
        </p>
      </div>

      <CategoryTree
        categories={categories}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        onReorder={handleReorderCategories}
      />
    </>
  );
}

import { getTranslations } from 'next-intl/server';
import { BrandsManager } from './BrandsManager';
import {
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
  toggleBrandStatusAction,
} from '@data/brands/actions';
import { BrandInput } from '@findeg/backend/features/catalog';
import { revalidatePath } from 'next/cache';

interface BrandsContentProps {
  locale: string;
}

/**
 * BrandsContent - Handles data fetching and brand management.
 * Separated to allow streaming with Suspense.
 */
export async function BrandsContent({ locale }: BrandsContentProps) {
  const t = await getTranslations('Administration.Catalog.Brands');
  
  // TODO: Replace with proper data layer query from @data/brands/queries
  // const brands = await getBrands(locale);
  const brands: any[] = []; // Stubbed - empty brand list

  /**
   * Wrapper for Save (Create/Update)
   */
  async function handleSave(data: BrandInput, id?: number) {
    'use server';
    const result = id 
      ? await updateBrandAction(id, data) 
      : await createBrandAction(data);
    
    if (result.success) {
      revalidatePath(`/${locale}/brands`);
    }
    return result;
  }

  /**
   * Wrapper for Delete
   */
  async function handleDelete(id: number) {
    'use server';
    // TODO: Check product count using data layer query
    const productCount = 0; // Stubbed

    if (productCount > 0) {
      return {
        success: false,
        error: 'DELETE_BLOCKED',
        count: productCount,
      };
    }

    const result = await deleteBrandAction(id);
    if (result.success) {
      revalidatePath(`/${locale}/brands`);
    }
    return result;
  }

  /**
   * Wrapper for Toggle
   */
  async function handleToggle(id: number) {
    'use server';
    const result = await toggleBrandStatusAction(id);
    if (result.success) {
      revalidatePath(`/${locale}/brands`);
    }
    return result;
  }

  return (
    <>
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {t('Title')}
        </h1>
        <p className="text-muted-foreground text-sm font-medium">{t('Subtitle')}</p>
      </div>

      <BrandsManager
        initialBrands={brands}
        onSave={handleSave}
        onDelete={handleDelete}
        onToggleStatus={handleToggle}
      />
    </>
  );
}

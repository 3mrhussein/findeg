'use client';

import useSWR from 'swr';
import { getCategoryTreeAction } from '@/app/[locale]/(storefront)/_actions/catalog';

export interface Category {
  id: number;
  slug: string;
  name: string;
  parentId?: number;
  depth?: number;
  icon?: string | null;
  image?: string | null;
  children?: Category[];
}

/**
 * Fetches the hierarchical category tree.
 * Caches for 5 minutes (300,000 ms).
 *
 * @param {string} locale - The current locale for translations (default "en").
 * @param {string} type - The response format: "tree", "roots", or "flat" (default "tree").
 */
export function useCategories(locale: string = 'en', type: string = 'tree') {
  const { data, error, isLoading } = useSWR<Category[]>(
    ['categories', locale, type],
    () => getCategoryTreeAction(locale),
    {
      dedupingInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  );

  return {
    categories: data || [],
    isLoading,
    isError: error,
  };
}

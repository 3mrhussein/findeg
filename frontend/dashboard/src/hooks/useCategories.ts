'use client';

import useSWR from 'swr';

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
 *
 */
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Fetches the hierarchical category tree.
 * Caches for 5 minutes (300,000 ms).
 *
 * @param {string} locale - The current locale for translations (default "en").
 * @param {string} type - The response format: "tree", "roots", or "flat" (default "tree").
 */
export function useCategories(locale: string = 'en', type: string = 'tree') {
  const { data, error, isLoading } = useSWR<Category[]>(
    `/api/v1/categories?lang=${locale}&type=${type}`,
    fetcher,
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

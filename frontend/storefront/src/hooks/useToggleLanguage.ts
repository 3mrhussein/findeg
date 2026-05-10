'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@i18n/navigation';
import { useSearchParams } from 'next/navigation';
import type { Language } from '@lib/types';

/**
 * Hook to handle language toggling logic.
 * Encapsulates next-intl navigation hooks and provides a toggle function.
 */
export function useToggleLanguage() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Toggles the current locale between supported languages.
   * Preserves the current path and search parameters.
   */
  function toggleLanguage(nextLocale: Language) {
    if (nextLocale === locale) return;

    const query = searchParams?.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { locale: nextLocale });
  }

  return {
    locale,
    toggleLanguage,
  };
}

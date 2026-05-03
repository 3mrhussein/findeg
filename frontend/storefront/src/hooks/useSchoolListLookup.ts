'use client';

import { useState } from 'react';
import { usePathname, useRouter } from '@i18n/navigation';

interface UseSchoolListLookupParams {
  initialCode?: string;
}

/**
 * Encapsulates school list lookup input and URL submit behavior.
 */
export function useSchoolListLookup({ initialCode = '' }: UseSchoolListLookupParams = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [code, setCode] = useState(initialCode);

  /**
   * Navigates to the same route with updated code query.
   */
  function submit() {
    const value = code.trim();
    if (!value) {
      router.push(pathname);
      return;
    }

    const params = new URLSearchParams();
    params.set('code', value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return {
    code,
    setCode,
    submit,
  };
}

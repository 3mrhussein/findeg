'use client';

import { useState } from 'react';
import { useRouter } from '@i18n/navigation';

interface UseSchoolListLookupParams {
  initialCode?: string;
}

/** The 32-character public code, whether pasted alone or inside a share link. */
const PUBLIC_CODE = /[0-9a-f]{32}/i;

/**
 * Encapsulates School Supply List lookup input and navigation to `/lists/<publicCode>`.
 */
export function useSchoolListLookup({ initialCode = '' }: UseSchoolListLookupParams = {}) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [invalid, setInvalid] = useState(false);

  /**
   * Opens the list for the pasted code or link, or flags the input as invalid.
   */
  function submit() {
    const match = PUBLIC_CODE.exec(code.trim());
    setInvalid(!match);
    if (match) router.push(`/lists/${match[0].toLowerCase()}`);
  }

  return {
    code,
    setCode,
    invalid,
    submit,
  };
}

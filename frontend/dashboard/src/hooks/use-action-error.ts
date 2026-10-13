import { useTranslations } from 'next-intl';

/** Translate known action failures without displaying internal or untranslated errors. */
export function useActionError(namespace: string) {
  const t = useTranslations(namespace);
  return (code?: string) => t(code && t.has(code) ? code : 'unknown');
}

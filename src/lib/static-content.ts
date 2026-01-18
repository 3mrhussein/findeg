import { getTranslation } from './i18n-server';
import { Language } from '@/types';
import { translations } from './i18n';

/**
 * Utility to fetch all static content for a specific page.
 * Recursively maps the deep structure to a single language.
 */
function resolveLocalizedObject(obj: any, language: Language): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  // If it's a leaf node with translations
  if (obj.en || obj.ar) {
    return obj[language] || obj['en'];
  }

  // Otherwise recurse
  const result: any = {};
  for (const key in obj) {
    result[key] = resolveLocalizedObject(obj[key], language);
  }
  return result;
}

export function getPageContent<T extends keyof typeof translations['pages']>(
  page: T,
  language: Language = 'en'
) {
  const { t } = getTranslation(language);
  
  const pageRaw = translations.pages[page];
  const commonRaw = translations.common;
  const layoutRaw = translations.layout;

  return {
    ...resolveLocalizedObject(pageRaw, language),
    common: resolveLocalizedObject(commonRaw, language),
    layout: resolveLocalizedObject(layoutRaw, language),
    t
  };
}

export type PageContent<T extends keyof typeof translations['pages']> = 
  ReturnType<typeof getPageContent<T>>;

import type { Locale } from './types';

/** Languages FindEg publishes in. Arabic is a first-class locale, not a translation fallback. */
export const LOCALES = ['en', 'ar'] as const;
export const DEFAULT_LOCALE: Locale = 'en';

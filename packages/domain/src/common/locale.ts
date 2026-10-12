/** Languages FindEg publishes in. Arabic is a first-class locale, not a translation fallback. */
export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Text shown in each supported locale. */
export interface LocalizedText {
  en: string;
  ar?: string;
}

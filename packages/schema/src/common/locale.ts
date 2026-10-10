/** Languages FindEg publishes in. Arabic is a first-class locale, not a translation fallback. */
export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Text that Staff or a Partner author once and that is shown in each supported locale. */
export interface LocalizedText {
  en: string;
  ar?: string;
}

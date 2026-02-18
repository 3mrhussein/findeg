import { z } from "zod";

/**
 * Canonical locale values supported by the product domain.
 * Keep this aligned with i18n routing locales.
 */
export const SUPPORTED_LOCALES = ["en", "ar"] as const;

export const DEFAULT_LOCALE: (typeof SUPPORTED_LOCALES)[number] = "en";

export const LocaleSchema = z.enum(SUPPORTED_LOCALES);
export type Locale = z.infer<typeof LocaleSchema>;

/**
 * Runtime type guard for locale strings.
 */
export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Safely resolves any input locale to a supported domain locale.
 */
export function resolveLocale(value?: string | null): Locale {
  if (!value) return DEFAULT_LOCALE;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}


/**
 * All locales supported by FindEg.
 * Add new locales here and the rest of the system adapts.
 */
export type SupportedLocale = "en" | "ar";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "ar"];

export const DEFAULT_LOCALE: SupportedLocale = "en";

/**
 * Resolves a localized JSONB field to a string for the given locale.
 * Falls back to English, then to empty string — never returns undefined.
 *
 * Use this for one-off locale resolution outside of domain entities.
 * For product/category/brand — prefer the entity's own getName() methods.
 */
export function resolveLocalized(
  localizedField: Partial<Record<SupportedLocale, string>> | null | undefined,
  locale: SupportedLocale,
): string {
  return localizedField?.[locale] ?? localizedField?.[DEFAULT_LOCALE] ?? "";
}

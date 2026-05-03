import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LocaleSchema,
  type Locale,
} from '@findeg/db';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, LocaleSchema, type Locale };

/**
 * Checks if a value is a supported domain locale.
 *
 * @param value - The value to validate.
 * @returns True if the value is one of the supported locales ("en", "ar").
 *
 * @example
 * if (valid("en")) { ... }
 */
export function valid(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Safely parses any input string to a supported domain locale.
 * If the input is null, undefined, or invalid, it returns the DEFAULT_LOCALE.
 *
 * @param value - The input string to parse (e.g., from request params, headers, or state).
 * @returns A valid supported locale, falling back to "en" by default.
 *
 * @example
 * const locale = parse(params.lang); // "en" or "ar"
 */
export function parse(value?: string | null): Locale {
  if (!value) return DEFAULT_LOCALE;
  return valid(value) ? value : DEFAULT_LOCALE;
}

// ─── Translation Structures ──────────────────────────────────────────

import {
  TranslationMapSchema,
  PartialTranslationMapSchema,
  type TranslationMap,
  type PartialTranslationMap,
} from '@findeg/db';

export {
  TranslationMapSchema,
  PartialTranslationMapSchema,
  type TranslationMap,
  type PartialTranslationMap,
};

/**
 * Normalizes partial translation data into a strict TranslationMap.
 * Every supported locale will have a value, falling back to the provided string if missing.
 *
 * @param value - The partial or incomplete translation data.
 * @param fallback - The string to fill for missing locales (defaults to "").
 * @returns A complete TranslationMap where all supported locales are guaranteed keys.
 *
 * @example
 * const name = asTranslationMap({ en: "Product" }); // { en: "Product", ar: "" }
 */
export function asTranslationMap(
  value: PartialTranslationMap | undefined,
  fallback: string = '',
): TranslationMap {
  const result = {} as TranslationMap;
  for (const locale of SUPPORTED_LOCALES) {
    result[locale] = value?.[locale] ?? fallback;
  }
  return result;
}

/**
 * Selects the translated string for a specific locale from a map.
 * If the requested locale is missing, it falls back to a primary locale.
 *
 * @param value - The TranslationMap containing localized strings.
 * @param locale - The requested locale to retrieve.
 * @param fallbackLocale - The locale to use if the requested one is empty/missing (defaults to "en").
 * @returns The best available translated string, or an empty string if none found.
 *
 * @example
 * const label = pick(product.names, "ar");
 */
export function pick(
  value: TranslationMap | undefined,
  locale: Locale,
  fallbackLocale: Locale = DEFAULT_LOCALE,
): string {
  if (!value) return '';
  return value[locale] ?? value[fallbackLocale] ?? '';
}

import { z } from "zod";

/**
 * Canonical locale values supported by the product domain.
 * Keep this aligned with i18n routing locales.
 */
export const SUPPORTED_LOCALES = ["en", "ar"] as const;

/**
 * The default locale used when no locale is specified or supported.
 */
export const DEFAULT_LOCALE: (typeof SUPPORTED_LOCALES)[number] = "en";

/**
 * Zod schema for validating supported locales.
 */
export const LocaleSchema = z.enum(SUPPORTED_LOCALES);

/**
 * Type representing a supported locale string.
 */
export type Locale = z.infer<typeof LocaleSchema>;

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
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
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

/**
 * Strict translation map that requires a value for all supported locales.
 * Ensuring all locales have at least an empty string prevents runtime errors
 * when accessing localized fields.
 */
export type TranslationMap<TLocale extends string = Locale> = Record<TLocale, string>;

/**
 * Zod schema for a full TranslationMap requiring values for all supported locales.
 */
export const TranslationMapSchema = z.object({
  en: z.string(),
  ar: z.string(),
});

/**
 * Zod schema for a partial set of translations, often used for user inputs.
 */
export const PartialTranslationMapSchema = TranslationMapSchema.partial();

/**
 * Type representing a partial set of translations.
 */
export type PartialTranslationMap = z.infer<typeof PartialTranslationMapSchema>;

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
  fallback: string = "",
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
  if (!value) return "";
  return value[locale] ?? value[fallbackLocale] ?? "";
}

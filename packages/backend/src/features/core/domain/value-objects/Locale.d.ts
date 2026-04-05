import { z } from "zod";
/**
 * Canonical locale values supported by the product domain.
 * Keep this aligned with i18n routing locales.
 */
export declare const SUPPORTED_LOCALES: readonly ["en", "ar"];
export declare const DEFAULT_LOCALE: (typeof SUPPORTED_LOCALES)[number];
export declare const LocaleSchema: z.ZodEnum<{
    en: "en";
    ar: "ar";
}>;
export type Locale = z.infer<typeof LocaleSchema>;
/**
 * Runtime type guard for locale strings.
 */
export declare function isLocale(value: string): value is Locale;
/**
 * Safely resolves any input locale to a supported domain locale.
 */
export declare function toLocale(value?: string | null): Locale;
export declare const resolveLocale: typeof toLocale;

import { z } from "zod";
/**
 * Canonical locale values supported by the product domain.
 * Keep this aligned with i18n routing locales.
 */
export const SUPPORTED_LOCALES = ["en", "ar"];
export const DEFAULT_LOCALE = "en";
export const LocaleSchema = z.enum(SUPPORTED_LOCALES);
/**
 * Runtime type guard for locale strings.
 */
export function isLocale(value) {
    return SUPPORTED_LOCALES.includes(value);
}
/**
 * Safely resolves any input locale to a supported domain locale.
 */
export function toLocale(value) {
    if (!value)
        return DEFAULT_LOCALE;
    return isLocale(value) ? value : DEFAULT_LOCALE;
}
// ─── Legacy Aliases (to be removed) ─────────────────────────────────────────
export const resolveLocale = toLocale;

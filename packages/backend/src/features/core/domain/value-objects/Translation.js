import { z } from "zod";
import { DEFAULT_LOCALE } from "./Locale";
export const LocalizedStringSchema = z.object({
    en: z.string(),
    ar: z.string(),
});
export const LocalizedStringDraftSchema = LocalizedStringSchema.partial();
/**
 * Converts partial localized data into a strict LocalizedString object.
 */
export function asLocalized(value, fallback = "") {
    var _a, _b;
    return {
        en: (_a = value === null || value === void 0 ? void 0 : value.en) !== null && _a !== void 0 ? _a : fallback,
        ar: (_b = value === null || value === void 0 ? void 0 : value.ar) !== null && _b !== void 0 ? _b : fallback,
    };
}
export function localize(value, locale, fallbackLocale = DEFAULT_LOCALE) {
    var _a, _b;
    if (!value)
        return "";
    return ((_b = (_a = value[locale]) !== null && _a !== void 0 ? _a : value[fallbackLocale]) !== null && _b !== void 0 ? _b : "");
}
export const LocalizedTextSchema = LocalizedStringSchema;
export const LocalizedTextDraftSchema = LocalizedStringDraftSchema;
export const localizeText = localize;
// ─── Legacy Aliases (to be removed) ─────────────────────────────────────────
export const resolveLocalizedString = localize;
export const resolveLocalizedText = localizeText;
export const toLocalizedString = asLocalized;

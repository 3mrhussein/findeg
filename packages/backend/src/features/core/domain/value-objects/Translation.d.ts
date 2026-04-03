import { z } from "zod";
import { type Locale } from "./Locale";
/**
 * Strict localized map: requires all supported locales.
 */
export type LocalizedString<TLocale extends string = Locale> = Record<TLocale, string>;
export declare const LocalizedStringSchema: z.ZodObject<{
    en: z.ZodString;
    ar: z.ZodString;
}, z.core.$strip>;
/**
 * Flexible localized map used while partial translations are being authored.
 */
export type LocalizedStringDraft<TLocale extends string = Locale> = Partial<LocalizedString<TLocale>>;
export declare const LocalizedStringDraftSchema: z.ZodObject<{
    en: z.ZodOptional<z.ZodString>;
    ar: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Converts partial localized data into a strict LocalizedString object.
 */
export declare function asLocalized(value: LocalizedStringDraft | undefined, fallback?: string): LocalizedString;
export declare function localize(value: LocalizedString | undefined, locale: Locale, fallbackLocale?: Locale): string;
/**
 * Backward-compatible aliases while migration is in progress.
 */
export type LocalizedText = LocalizedString;
export type LocalizedTextDraft = LocalizedStringDraft;
export declare const LocalizedTextSchema: z.ZodObject<{
    en: z.ZodString;
    ar: z.ZodString;
}, z.core.$strip>;
export declare const LocalizedTextDraftSchema: z.ZodObject<{
    en: z.ZodOptional<z.ZodString>;
    ar: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const localizeText: typeof localize;
export declare const resolveLocalizedString: typeof localize;
export declare const resolveLocalizedText: typeof localize;
export declare const toLocalizedString: typeof asLocalized;

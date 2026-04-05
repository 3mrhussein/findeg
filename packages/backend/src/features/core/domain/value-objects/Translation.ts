import { z } from "zod";
import { DEFAULT_LOCALE, type Locale } from "./Locale";

/**
 * Strict localized map: requires all supported locales.
 */
export type LocalizedString<TLocale extends string = Locale> = Record<TLocale, string>;

export const LocalizedStringSchema = z.object({
  en: z.string(),
  ar: z.string(),
});

/**
 * Flexible localized map used while partial translations are being authored.
 */
export type LocalizedStringDraft<TLocale extends string = Locale> = Partial<
  LocalizedString<TLocale>
>;
export const LocalizedStringDraftSchema = LocalizedStringSchema.partial();

/**
 * Converts partial localized data into a strict LocalizedString object.
 */
export function asLocalized(
  value: LocalizedStringDraft | undefined,
  fallback: string = "",
): LocalizedString {
  return {
    en: value?.en ?? fallback,
    ar: value?.ar ?? fallback,
  };
}

export function localize(
  value: LocalizedString | undefined,
  locale: Locale,
  fallbackLocale: Locale = DEFAULT_LOCALE,
): string {
  if (!value) return "";
  return (
    value[locale as keyof LocalizedString] ?? value[fallbackLocale as keyof LocalizedString] ?? ""
  );
}

/**
 * Backward-compatible aliases while migration is in progress.
 */
export type LocalizedText = LocalizedString;
export type LocalizedTextDraft = LocalizedStringDraft;
export const LocalizedTextSchema = LocalizedStringSchema;
export const LocalizedTextDraftSchema = LocalizedStringDraftSchema;
export const localizeText = localize;

// ─── Legacy Aliases (to be removed) ─────────────────────────────────────────
export const resolveLocalizedString = localize;
export const resolveLocalizedText = localizeText;
export const toLocalizedString = asLocalized;

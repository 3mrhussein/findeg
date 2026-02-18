import { z } from "zod";
import { DEFAULT_LOCALE, type Locale } from "./Locale";

/**
 * Strict localized map: requires all supported locales.
 */
export type LocalizedString = Record<Locale, string>;

export const LocalizedStringSchema = z.object({
  en: z.string(),
  ar: z.string(),
});

/**
 * Flexible localized map used while partial translations are being authored.
 */
export type LocalizedStringDraft = Partial<LocalizedString>;
export const LocalizedStringDraftSchema = LocalizedStringSchema.partial();

/**
 * Converts partial localized data into a strict LocalizedString object.
 */
export function toLocalizedString(
  value: LocalizedStringDraft | undefined,
  fallback: string = "",
): LocalizedString {
  return {
    en: value?.en ?? fallback,
    ar: value?.ar ?? fallback,
  };
}

/**
 * Resolves localized string with deterministic fallback.
 */
export function resolveLocalizedString(
  value: LocalizedString | undefined,
  locale: Locale,
  fallbackLocale: Locale = DEFAULT_LOCALE,
): string {
  if (!value) return "";
  return value[locale] ?? value[fallbackLocale] ?? "";
}

/**
 * Backward-compatible aliases while migration is in progress.
 */
export type LocalizedText = LocalizedString;
export type LocalizedTextDraft = LocalizedStringDraft;
export const LocalizedTextSchema = LocalizedStringSchema;
export const LocalizedTextDraftSchema = LocalizedStringDraftSchema;
export const resolveLocalizedText = resolveLocalizedString;

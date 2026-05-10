import { z } from 'zod';

/**
 * Core Shared Types for Database Layer
 *
 * These types are defined here to keep the db package framework-agnostic
 * and prevent circular dependencies with the backend package.
 */

// ─── Locale ─────────────────────────────────────────────────────────────────

export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export const DEFAULT_LOCALE: (typeof SUPPORTED_LOCALES)[number] = 'en';

export const LocaleSchema = z.enum(SUPPORTED_LOCALES);
export type Locale = z.infer<typeof LocaleSchema>;

// ─── Translations ───────────────────────────────────────────────────────────

export const TranslationMapSchema = z.object({
  en: z.string(),
  ar: z.string().optional(),
});

export type TranslationMap = z.infer<typeof TranslationMapSchema>;

// ─── Money & Currency ───────────────────────────────────────────────────────

export const CurrencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Currency must be a 3-letter code');

export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;
export const DEFAULT_CURRENCY: CurrencyCode = 'EGP';

export const MoneyAmountSchema = z.number().finite().nonnegative();
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;

export const MoneySchema = z.object({
  amount: MoneyAmountSchema,
  currency: CurrencyCodeSchema.default(DEFAULT_CURRENCY),
});

export type Money = z.infer<typeof MoneySchema>;

// ─── Core Primitives ────────────────────────────────────────────────────────

/** Unique identifier across domain entities */
export const IdSchema = z.coerce.number().int().positive();
export type ID = z.infer<typeof IdSchema>;

/** Stock Keeping Unit - unique alphanumeric product code */
export const SkuSchema = z
  .string()
  .regex(/^[A-Za-z0-9\-_]*$/, 'Invalid SKU format')
  .optional();

export const SkuRequiredSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9\-_]+$/, 'Invalid SKU format');

export type Sku = string;

export const EmailSchema = z.string().email();
export type Email = z.infer<typeof EmailSchema>;

export const SlugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens');

export type Slug = z.infer<typeof SlugSchema>;

export const QuantitySchema = z.coerce.number().int().nonnegative();
export type Quantity = z.infer<typeof QuantitySchema>;

/** Rating value (usually 0-5) */
export const RatingSchema = z.number().min(0).max(5);
export type Rating = z.infer<typeof RatingSchema>;

// ─── Media ──────────────────────────────────────────────────────────────────

export const MediaVariantKeySchema = z.enum(['thumbnail', 'card', 'pdp', 'zoom', 'original']);
export type MediaVariantKey = z.infer<typeof MediaVariantKeySchema>;

export const MediaAssetSchema = z.object({
  url: z.string().url(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  mimeType: z.string().optional(),
  alt: TranslationMapSchema.optional(),
});

export type MediaAsset = z.infer<typeof MediaAssetSchema>;

export const ResponsiveMediaSetSchema = z.object({
  thumbnail: MediaAssetSchema.optional(),
  card: MediaAssetSchema.optional(),
  pdp: MediaAssetSchema.optional(),
  zoom: MediaAssetSchema.optional(),
  original: MediaAssetSchema.optional(),
});

export type ResponsiveMediaSet = z.infer<typeof ResponsiveMediaSetSchema>;

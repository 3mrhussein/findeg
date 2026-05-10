/**
 * Domain Entity: Variant (SKU)
 *
 * Represents a purchasable Stock Keeping Unit within a product (SPU).
 * Variants carry their own price, images, attributes, and inventory.
 *
 * For simple products with no dimensions, a single "default" variant exists.
 */

import { z } from 'zod';
import { productVariants } from '@findeg/db/schema';
import { type InferSelectModel } from 'drizzle-orm';
import {
  IdSchema,
  PriceSchema,
  TranslationMapSchema,
  type Locale,
} from '../../../core/domain/types/common';
import type { CurrencyCode, Money } from '../../../core/domain/value-objects';
import { DEFAULT_CURRENCY, toMoney, pick } from '../../../core/domain/value-objects';

// ─── Variant Image ───────────────────────────────────────────────────────────

export const VariantImageSchema = z.object({
  id: IdSchema.optional(),
  variantId: IdSchema.optional(),
  url: z.string(),
  alt: z.string().optional(),
  displayOrder: z.number().default(0),
});
export type VariantImage = z.infer<typeof VariantImageSchema>;


// ─── Inventory Balance ───────────────────────────────────────────────────────

export const InventoryBalanceSchema = z.object({
  warehouseId: IdSchema.optional(),
  warehouseCode: z.string().optional(),
  onHand: z.number().int().nonnegative().default(0),
  reserved: z.number().int().nonnegative().default(0),
});
export type InventoryBalance = z.infer<typeof InventoryBalanceSchema>;

// ─── Variant Attribute Value ─────────────────────────────────────────────────

export const VariantAttributeValueSchema = z.object({
  attributeId: IdSchema,
  key: z.string(),
  valueText: z.string().optional(),
  valueNum: z.number().optional(),
  valueBool: z.boolean().optional(),
});
export type VariantAttributeValue = z.infer<typeof VariantAttributeValueSchema>;

// ─── Variant Schema ──────────────────────────────────────────────────────────

export const VariantSchema = z.object({
  id: IdSchema,
  productId: IdSchema,
  sku: z.string(),
  variantKey: z.string(),
  localizedLabel: TranslationMapSchema.optional(),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),

  // Pricing
  basePrice: z.union([z.number(), z.string()]), // Decimal can be string in some contexts
  strikePrice: z.union([z.number(), z.string()]).optional(),
  costPrice: z.union([z.number(), z.string()]).optional(),

  // Physical
  weightGrams: z.number().optional(),
  barcode: z.string().optional(),
  lowStockThreshold: z.number().default(10),

  // Hydrated children (loaded by query layer)
  images: z.array(VariantImageSchema).optional(),
  attributes: z.array(VariantAttributeValueSchema).optional(),
  inventory: z.array(InventoryBalanceSchema).optional(),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Variant = z.infer<typeof VariantSchema> &
  Partial<
    Omit<InferSelectModel<typeof productVariants>, 'basePrice' | 'strikePrice' | 'costPrice'>
  >;

// ─── Input Schemas ───────────────────────────────────────────────────────────

export const CreateVariantSchema = VariantSchema.omit({ id: true });
export type CreateVariant = z.infer<typeof CreateVariantSchema>;

export const UpdateVariantSchema = CreateVariantSchema.partial().extend({
  id: IdSchema,
});
export type UpdateVariant = z.infer<typeof UpdateVariantSchema>;

// ─── Domain Methods ──────────────────────────────────────────────────────────

export class VariantEntity {
  constructor(private variant: Variant) {}

  getLabel(locale: Locale): string {
    return pick(this.variant.localizedLabel, locale);
  }

  getDisplayPrice(currency: string = DEFAULT_CURRENCY): Money {
    return toMoney(Number(this.variant.basePrice), currency as CurrencyCode);
  }

  getStrikePrice(currency: string = DEFAULT_CURRENCY): Money | undefined {
    if (this.variant.strikePrice === undefined) return undefined;
    return toMoney(Number(this.variant.strikePrice), currency as CurrencyCode);
  }

  getDiscountPercentage(): number {
    const strikePrice = Number(this.variant.strikePrice || 0);
    const basePrice = Number(this.variant.basePrice);
    if (!strikePrice || strikePrice <= basePrice) return 0;
    return Math.round(((strikePrice - basePrice) / strikePrice) * 100);
  }


  getAvailableStock(): number {
    if (!this.variant.inventory || this.variant.inventory.length === 0) return 0;
    return this.variant.inventory.reduce((sum, bal) => sum + (bal.onHand - bal.reserved), 0);
  }

  isInStock(): boolean {
    return this.getAvailableStock() > 0;
  }

  isLowStock(): boolean {
    const available = this.getAvailableStock();
    return available > 0 && available <= this.variant.lowStockThreshold;
  }

  getData(): Variant {
    return this.variant;
  }
}

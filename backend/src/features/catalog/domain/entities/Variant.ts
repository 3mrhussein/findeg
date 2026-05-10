/**
 * Domain Entity: Variant (SKU)
 *
 * Represents a purchasable Stock Keeping Unit within a product (SPU).
 * Variants carry their own price, images, attributes, UOMs, and inventory.
 *
 * For simple products with no dimensions, a single "default" variant exists.
 */

import { z } from 'zod';
import { productVariants } from '@findeg/db/schema';
import { type InferSelectModel } from 'drizzle-orm';
import {
  IdSchema,
  PriceSchema,
  CustomerGroupSchema,
  UomCodeSchema,
  TranslationMapSchema,
  type CustomerGroup,
  type UomCode,
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

// ─── Sellable UOM ────────────────────────────────────────────────────────────

export const SellableUomSchema = z.object({
  uomCode: UomCodeSchema,
  factorToBase: z.number().positive(),
  isEnabled: z.boolean().default(true),
  localizedLabel: TranslationMapSchema.optional(),
  barcode: z.string().optional(),
});
export type SellableUom = z.infer<typeof SellableUomSchema>;

// ─── Price List Entry ────────────────────────────────────────────────────────

export const PriceListEntrySchema = z.object({
  customerGroup: CustomerGroupSchema,
  uomCode: UomCodeSchema,
  unitPrice: PriceSchema,
  currency: z.string().default('EGP'),
  isSellable: z.boolean().default(true),
  minQty: z.number().int().positive().default(1),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});
export type PriceListEntry = z.infer<typeof PriceListEntrySchema>;

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
  sellableUoms: z.array(SellableUomSchema).optional(),
  priceLists: z.array(PriceListEntrySchema).optional(),
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

  /**
   * Returns the price for a specific UOM and customer group.
   * Falls back to basePrice × factor if no price list entry exists.
   */
  getPriceForUom(
    uomCode: UomCode,
    customerGroup: CustomerGroup = 'public_b2c',
  ): { unitPrice: number; currency: string; isSellable: boolean } | null {
    // Try the price list first
    const entry = this.variant.priceLists?.find(
      (p) => p.uomCode === uomCode && p.customerGroup === customerGroup,
    );
    if (entry) {
      return {
        unitPrice: entry.unitPrice,
        currency: entry.currency,
        isSellable: entry.isSellable,
      };
    }

    // Fallback: basePrice × UOM factor
    const uom = this.variant.sellableUoms?.find((u) => u.uomCode === uomCode);
    if (uom) {
      return {
        unitPrice: Number(this.variant.basePrice) * uom.factorToBase,
        currency: DEFAULT_CURRENCY,
        isSellable: uom.isEnabled,
      };
    }

    return null;
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

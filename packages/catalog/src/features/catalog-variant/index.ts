/**
 * Domain Entity: Variant (SKU)
 *
 * Represents a purchasable Stock Keeping Unit within a product (SPU).
 * Variants carry their own price, images, attributes, and inventory.
 *
 * For simple products with no dimensions, a single "default" variant exists.
 */

import { z } from 'zod';
import { discountPercentage } from '@findeg/domain';
import { freeUnits, stockLevel } from '@findeg/domain';
import { moneyFromDecimal, type Money } from '@findeg/domain';
import {
  IdSchema as idSchema,
  TranslationMapSchema as translationMapSchema,
} from '@findeg/db/types';
import type { Locale } from '@findeg/domain';
import { pick, ResponsiveMediaSetSchema as responsiveMediaSetSchema } from '../../helpers/index';

// ─── Variant Image ───────────────────────────────────────────────────────────

const variantImageSchema = z.object({
  id: idSchema.optional(),
  variantId: idSchema.optional(),
  url: z.string(),
  alt: z.string().optional(),
  displayOrder: z.number().default(0),
});
export type VariantImage = z.infer<typeof variantImageSchema>;

// ─── Inventory Balance ───────────────────────────────────────────────────────

const inventoryBalanceSchema = z.object({
  warehouseId: idSchema.optional(),
  warehouseCode: z.string().optional(),
  /** Only active warehouses are sold from. Unknown warehouses are not. */
  warehouseActive: z.boolean().optional(),
  onHand: z.number().int().nonnegative().default(0),
  reserved: z.number().int().nonnegative().default(0),
});
export type InventoryBalance = z.infer<typeof inventoryBalanceSchema>;

// ─── Variant Attribute Value ─────────────────────────────────────────────────

const variantAttributeValueSchema = z.object({
  attributeId: idSchema,
  key: z.string(),
  valueText: z.string().optional(),
});
export type VariantAttributeValue = z.infer<typeof variantAttributeValueSchema>;

// ─── Variant Schema ──────────────────────────────────────────────────────────

const variantSchema = z.object({
  id: idSchema,
  productId: idSchema,
  sku: z.string(),
  variantKey: z.string(),
  localizedLabel: translationMapSchema.optional(),
  sortOrder: z.number().default(0),
  isDefault: z.boolean().default(false),
  mediaSet: responsiveMediaSetSchema.optional(),
  isActive: z.boolean().default(true),

  // Pricing
  basePrice: z.union([z.number(), z.string()]), // Decimal can be string in some contexts
  strikePrice: z.union([z.number(), z.string()]).optional(),
  costPrice: z.union([z.number(), z.string()]).optional(),

  // Physical
  weightGrams: z.number().optional(),
  barcode: z.string().optional(),

  // Hydrated children (loaded by query layer)
  images: z.array(variantImageSchema).optional(),
  attributes: z.array(variantAttributeValueSchema).optional(),
  inventory: z.array(inventoryBalanceSchema).optional(),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Variant = z.infer<typeof variantSchema>;

// ─── Input Schemas ───────────────────────────────────────────────────────────

const createVariantSchema = variantSchema.omit({ id: true });
export type CreateVariant = z.infer<typeof createVariantSchema>;

const updateVariantSchema = createVariantSchema.partial().extend({
  id: idSchema,
});
export type UpdateVariant = z.infer<typeof updateVariantSchema>;

// ─── Domain Methods ──────────────────────────────────────────────────────────

export class VariantEntity {
  constructor(private variant: Variant) {}

  getLabel(locale: Locale): string {
    return pick(this.variant.localizedLabel, locale);
  }

  getDisplayPrice(): Money {
    return moneyFromDecimal(String(this.variant.basePrice));
  }

  getStrikePrice(): Money | undefined {
    if (this.variant.strikePrice === undefined) return undefined;
    return moneyFromDecimal(String(this.variant.strikePrice));
  }

  /**
   * Returns discount percentage against the compare-at price, rounded to the nearest whole number.
   */
  getDiscountPercentage(): number {
    return discountPercentage({
      price: moneyFromDecimal(Number(this.variant.basePrice).toFixed(2)),
      compareAtPrice:
        this.variant.strikePrice != null
          ? moneyFromDecimal(Number(this.variant.strikePrice).toFixed(2))
          : null,
    });
  }

  /** Units a Customer can buy: free units summed over active warehouses (domain availableStock). */
  getAvailableStock(): number {
    return (this.variant.inventory ?? [])
      .filter((bal) => bal.warehouseActive)
      .reduce((sum, bal) => sum + freeUnits(bal), 0);
  }

  /**
   * Indicates whether the variant has sellable units available in active warehouses.
   */
  isInStock(): boolean {
    return stockLevel(this.getAvailableStock()) !== 'out-of-stock';
  }

  /**
   * Indicates whether the available stock is within the low stock threshold (1 to 5 units).
   */
  isLowStock(): boolean {
    return stockLevel(this.getAvailableStock()) === 'low-stock';
  }

  getData(): Variant {
    return this.variant;
  }
}

// ─── Plain-function accessors for consumers outside the backend package ──────
// VariantEntity stays internal (ADR-0001: barrels never export concrete
// classes); this wraps the one method frontend call sites need.

export function getVariantAvailableStock(variant: Variant): number {
  return new VariantEntity(variant).getAvailableStock();
}

export {
  variantImageSchema as VariantImageSchema,
  inventoryBalanceSchema as InventoryBalanceSchema,
  variantAttributeValueSchema as VariantAttributeValueSchema,
  variantSchema as VariantSchema,
  createVariantSchema as CreateVariantSchema,
  updateVariantSchema as UpdateVariantSchema,
};

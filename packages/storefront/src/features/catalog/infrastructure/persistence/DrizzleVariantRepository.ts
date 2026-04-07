import { db } from "@features/core/infrastructure/persistence";
import {
  productVariants,
  variantImages,
  variantAttributes,
  variantSellableUoms,
  variantPriceLists,
  attributeDefinitions,
} from "@features/core/infrastructure/persistence/schema";
import {
  IVariantRepository,
  SellOption,
  PriceResult,
} from "../../application/interfaces/IVariantRepository";
import { Variant } from "../../domain/entities/Variant";
import { VariantInput } from "@features/administration/domain/types/ProductInput";
import { eq, and, inArray, sql } from "drizzle-orm";
import { ID, Price, CustomerGroup, UomCode } from "@features/core/domain/types/common";
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  type CurrencyCode,
  type Locale,
} from "@features/core/domain/value-objects";

/**
 * Drizzle Variant Repository
 *
 * Implements SKU-level data access, pricing resolution, and UOM management.
 */
export class DrizzleVariantRepository implements IVariantRepository {
  private mapToDomain(
    v: any,
    images: any[] = [],
    attrs: any[] = [],
    uoms: any[] = [],
    prices: any[] = [],
  ): Variant {
    return {
      id: v.id,
      productId: v.productId,
      sku: v.sku,
      variantKey: v.variantKey,
      localizedLabel: (v.localizedLabel as any) || { en: "", ar: "" },
      displayOrder: v.displayOrder,
      isActive: v.isActive,
      basePrice: Number(v.basePrice),
      strikePrice: v.strikePrice ? Number(v.strikePrice) : undefined,
      costPrice: v.costPrice ? Number(v.costPrice) : undefined,
      weightGrams: v.weightGrams ? Number(v.weightGrams) : undefined,
      barcode: v.barcode || undefined,
      lowStockThreshold: v.lowStockThreshold,
      images: images.map((img) => ({
        id: img.id,
        variantId: img.variantId,
        url: img.url,
        alt: img.alt || undefined,
        displayOrder: img.displayOrder,
      })),
      attributes: attrs.map((a) => ({
        attributeId: a.attributeId,
        key: a.key,
        valueText: a.valueText || undefined,
        valueNum: a.valueNum ? Number(a.valueNum) : undefined,
        valueBool: a.valueBool ?? undefined,
      })),
      sellableUoms: uoms.map((u) => ({
        uomCode: u.uomCode as UomCode,
        factorToBase: Number(u.factorToBase),
        isEnabled: u.isEnabled,
        localizedLabel: (u.localizedLabel as any) || undefined,
        barcode: u.barcode || undefined,
      })),
      priceLists: prices.map((p) => ({
        customerGroup: p.customerGroup as CustomerGroup,
        uomCode: p.uomCode as UomCode,
        unitPrice: Number(p.unitPrice) as Price,
        currency: p.currency as CurrencyCode,
        isSellable: p.isSellable,
        minQty: p.minQty,
        startsAt: p.startsAt?.toISOString() || undefined,
        endsAt: p.endsAt?.toISOString() || undefined,
      })),
    };
  }

  async getByProductId(productId: ID): Promise<Variant[]> {
    const variantRows = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(productVariants.displayOrder);

    if (variantRows.length === 0) return [];

    const variantIds = variantRows.map((v) => v.id);

    const [images, attrs, uoms, prices] = await Promise.all([
      db
        .select()
        .from(variantImages)
        .where(inArray(variantImages.variantId, variantIds))
        .orderBy(variantImages.displayOrder),
      db
        .select({
          variantId: variantAttributes.variantId,
          attributeId: variantAttributes.attributeId,
          key: attributeDefinitions.key,
          valueText: variantAttributes.valueText,
          valueNum: variantAttributes.valueNum,
          valueBool: variantAttributes.valueBool,
        })
        .from(variantAttributes)
        .innerJoin(attributeDefinitions, eq(variantAttributes.attributeId, attributeDefinitions.id))
        .where(inArray(variantAttributes.variantId, variantIds)),
      db
        .select()
        .from(variantSellableUoms)
        .where(inArray(variantSellableUoms.variantId, variantIds)),
      db.select().from(variantPriceLists).where(inArray(variantPriceLists.variantId, variantIds)),
    ]);

    return variantRows.map((v) => {
      const vImages = images.filter((img) => img.variantId === v.id);
      const vAttrs = attrs.filter((a) => a.variantId === v.id);
      const vUoms = uoms.filter((u) => u.variantId === v.id);
      const vPrices = prices.filter((p) => p.variantId === v.id);
      return this.mapToDomain(v, vImages, vAttrs, vUoms, vPrices);
    });
  }

  async getById(variantId: ID): Promise<Variant | null> {
    const [v] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);

    if (!v) return null;

    const [images, attrs, uoms, prices] = await Promise.all([
      db
        .select()
        .from(variantImages)
        .where(eq(variantImages.variantId, variantId))
        .orderBy(variantImages.displayOrder),
      db
        .select({
          variantId: variantAttributes.variantId,
          attributeId: variantAttributes.attributeId,
          key: attributeDefinitions.key,
          valueText: variantAttributes.valueText,
          valueNum: variantAttributes.valueNum,
          valueBool: variantAttributes.valueBool,
        })
        .from(variantAttributes)
        .innerJoin(attributeDefinitions, eq(variantAttributes.attributeId, attributeDefinitions.id))
        .where(eq(variantAttributes.variantId, variantId)),
      db.select().from(variantSellableUoms).where(eq(variantSellableUoms.variantId, variantId)),
      db.select().from(variantPriceLists).where(eq(variantPriceLists.variantId, variantId)),
    ]);

    return this.mapToDomain(v, images, attrs, uoms, prices);
  }

  async getBySku(sku: string): Promise<Variant | null> {
    const [v] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.sku, sku))
      .limit(1);

    if (!v) return null;
    return this.getById(v.id);
  }

  async create(productId: ID, input: VariantInput): Promise<Variant> {
    return await db.transaction(async (tx) => {
      const [newVariant] = await tx
        .insert(productVariants)
        .values({
          productId,
          sku: input.sku,
          variantKey: input.variantKey,
          localizedLabel: input.localizedLabel || {},
          displayOrder: input.displayOrder || 0,
          isActive: input.isActive ?? true,
          basePrice: String(input.basePrice),
          strikePrice: input.strikePrice ? String(input.strikePrice) : null,
          costPrice: input.costPrice ? String(input.costPrice) : null,
          weightGrams: input.weightGrams,
          barcode: input.barcode,
          lowStockThreshold: input.lowStockThreshold || 10,
        })
        .returning();

      if (input.images?.length) {
        await tx.insert(variantImages).values(
          input.images.map((img) => ({
            variantId: newVariant.id,
            url: img.url,
            alt: img.alt,
            displayOrder: img.displayOrder || 0,
          })),
        );
      }

      if (input.attributes?.length) {
        await tx.insert(variantAttributes).values(
          input.attributes.map((attr) => ({
            variantId: newVariant.id,
            attributeId: attr.attributeId,
            valueText: attr.valueText,
            valueNum: attr.valueNum ? String(attr.valueNum) : null,
            valueBool: attr.valueBool,
          })),
        );
      }

      if (input.sellableUoms?.length) {
        await tx.insert(variantSellableUoms).values(
          input.sellableUoms.map((u) => ({
            variantId: newVariant.id,
            uomCode: u.uomCode as any, // Cast to match schema enum/text
            factorToBase: String(u.factorToBase),
            isEnabled: u.isEnabled,
            localizedLabel: u.localizedLabel || {},
            barcode: u.barcode,
          })),
        );
      }

      if (input.priceLists?.length) {
        await tx.insert(variantPriceLists).values(
          input.priceLists.map((p) => ({
            variantId: newVariant.id,
            customerGroup: p.customerGroup as any, // Cast to match schema enum/text
            uomCode: p.uomCode as any, // Cast to match schema enum/text
            unitPrice: String(p.unitPrice),
            currency: (p.currency as any) || DEFAULT_CURRENCY,
            isSellable: p.isSellable,
            minQty: p.minQty,
          })),
        );
      }

      const hydrated = await this.getById(newVariant.id);
      if (!hydrated) throw new Error("Failed to retrieve created variant");
      return hydrated;
    });
  }

  async update(variantId: ID, input: Partial<VariantInput>): Promise<Variant> {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, variantId))
        .limit(1);
      if (!existing) throw new Error(`Variant ${variantId} not found`);

      await tx
        .update(productVariants)
        .set({
          sku: input.sku,
          variantKey: input.variantKey,
          localizedLabel: input.localizedLabel,
          displayOrder: input.displayOrder,
          isActive: input.isActive,
          basePrice: input.basePrice ? String(input.basePrice) : undefined,
          strikePrice: input.strikePrice ? String(input.strikePrice) : undefined,
          costPrice: input.costPrice ? String(input.costPrice) : undefined,
          weightGrams: input.weightGrams,
          barcode: input.barcode,
          lowStockThreshold: input.lowStockThreshold,
          updatedAt: new Date(),
        })
        .where(eq(productVariants.id, variantId));

      // Simple sync for images, attributes, UOMs, prices: delete and re-insert if provided
      if (input.images !== undefined) {
        await tx.delete(variantImages).where(eq(variantImages.variantId, variantId));
        if (input.images.length > 0) {
          await tx.insert(variantImages).values(
            input.images.map((img) => ({
              variantId,
              url: img.url,
              alt: img.alt,
              displayOrder: img.displayOrder || 0,
            })),
          );
        }
      }

      if (input.attributes !== undefined) {
        await tx.delete(variantAttributes).where(eq(variantAttributes.variantId, variantId));
        if (input.attributes.length > 0) {
          await tx.insert(variantAttributes).values(
            input.attributes.map((attr) => ({
              variantId,
              attributeId: attr.attributeId,
              valueText: attr.valueText,
              valueNum: attr.valueNum ? String(attr.valueNum) : null,
              valueBool: attr.valueBool,
            })),
          );
        }
      }

      if (input.sellableUoms !== undefined) {
        await tx.delete(variantSellableUoms).where(eq(variantSellableUoms.variantId, variantId));
        if (input.sellableUoms.length > 0) {
          await tx.insert(variantSellableUoms).values(
            input.sellableUoms.map((u) => ({
              variantId,
              uomCode: u.uomCode as any,
              factorToBase: String(u.factorToBase),
              isEnabled: u.isEnabled,
              localizedLabel: u.localizedLabel || {},
              barcode: u.barcode,
            })),
          );
        }
      }

      if (input.priceLists !== undefined) {
        await tx.delete(variantPriceLists).where(eq(variantPriceLists.variantId, variantId));
        if (input.priceLists.length > 0) {
          await tx.insert(variantPriceLists).values(
            input.priceLists.map((p) => ({
              variantId,
              customerGroup: p.customerGroup as any,
              uomCode: p.uomCode as any,
              unitPrice: String(p.unitPrice),
              currency: (p.currency as any) || DEFAULT_CURRENCY,
              isSellable: p.isSellable,
              minQty: p.minQty,
            })),
          );
        }
      }

      const hydrated = await this.getById(variantId);
      if (!hydrated) throw new Error("Failed to retrieve updated variant");
      return hydrated;
    });
  }

  /**
   * Deletes a variant and cascading data.
   */
  async delete(variantId: ID): Promise<void> {
    await db.delete(productVariants).where(eq(productVariants.id, variantId));
  }

  async getSellOptions(
    variantId: ID,
    customerGroup: CustomerGroup = "public_b2c",
  ): Promise<SellOption[]> {
    const [uoms, prices] = await Promise.all([
      db.select().from(variantSellableUoms).where(eq(variantSellableUoms.variantId, variantId)),
      db
        .select()
        .from(variantPriceLists)
        .where(
          and(
            eq(variantPriceLists.variantId, variantId),
            eq(variantPriceLists.customerGroup, customerGroup),
          ),
        ),
    ]);

    return uoms.map((u) => {
      const price = prices.find((p) => p.uomCode === u.uomCode);
      return {
        uomCode: u.uomCode as UomCode,
        factorToBase: Number(u.factorToBase),
        isEnabled: u.isEnabled,
        unitPrice: price ? (Number(price.unitPrice) as Price) : undefined,
        currency: price ? (price.currency as CurrencyCode) : undefined,
        isSellable: price ? price.isSellable : undefined,
      };
    });
  }

  async resolveUnitPrice(
    variantId: ID,
    uomCode: UomCode,
    customerGroup: CustomerGroup,
  ): Promise<PriceResult | null> {
    const [price] = await db
      .select()
      .from(variantPriceLists)
      .where(
        and(
          eq(variantPriceLists.variantId, variantId),
          eq(variantPriceLists.uomCode, uomCode),
          eq(variantPriceLists.customerGroup, customerGroup),
        ),
      )
      .limit(1);

    if (price) {
      return {
        unitPrice: Number(price.unitPrice) as Price,
        currency: price.currency as CurrencyCode,
        isSellable: price.isSellable,
      };
    }

    // Fallback logic if needed (e.g. from basePrice * factor)
    const [variant] = await db
      .select({ basePrice: productVariants.basePrice })
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);

    const [uom] = await db
      .select({ factorToBase: variantSellableUoms.factorToBase })
      .from(variantSellableUoms)
      .where(
        and(eq(variantSellableUoms.variantId, variantId), eq(variantSellableUoms.uomCode, uomCode)),
      )
      .limit(1);

    if (variant && uom) {
      return {
        unitPrice: (Number(variant.basePrice) * Number(uom.factorToBase)) as Price,
        currency: DEFAULT_CURRENCY,
        isSellable: true,
      };
    }

    return null;
  }

  async upsertSellableUoms(
    variantId: ID,
    uoms: { uomCode: UomCode; factorToBase: number; isEnabled?: boolean }[],
  ): Promise<void> {
    const [variant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);
    if (!variant) throw new Error("Variant not found");

    await db.transaction(async (tx) => {
      for (const u of uoms) {
        await tx
          .insert(variantSellableUoms)
          .values({
            variantId,
            uomCode: u.uomCode as any,
            factorToBase: String(u.factorToBase),
            isEnabled: u.isEnabled ?? true,
          })
          .onConflictDoUpdate({
            target: [variantSellableUoms.variantId, variantSellableUoms.uomCode],
            set: {
              factorToBase: String(u.factorToBase),
              isEnabled: u.isEnabled ?? true,
            },
          });
      }
    });
  }

  async upsertPriceLists(
    variantId: ID,
    prices: {
      customerGroup: CustomerGroup;
      uomCode: UomCode;
      unitPrice: Price;
      currency?: CurrencyCode;
      isSellable?: boolean;
    }[],
  ): Promise<void> {
    const [variant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);
    if (!variant) throw new Error("Variant not found");

    await db.transaction(async (tx) => {
      for (const p of prices) {
        await tx
          .insert(variantPriceLists)
          .values({
            variantId,
            customerGroup: p.customerGroup as any,
            uomCode: p.uomCode as any,
            unitPrice: String(p.unitPrice),
            currency: (p.currency as any) || DEFAULT_CURRENCY,
            isSellable: p.isSellable ?? true,
          })
          .onConflictDoUpdate({
            target: [
              variantPriceLists.variantId,
              variantPriceLists.customerGroup,
              variantPriceLists.uomCode,
              variantPriceLists.minQty,
            ],
            set: {
              unitPrice: String(p.unitPrice),
              currency: (p.currency as any) || DEFAULT_CURRENCY,
              isSellable: p.isSellable ?? true,
            },
          });
      }
    });
  }
}

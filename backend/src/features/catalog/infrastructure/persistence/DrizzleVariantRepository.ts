import { db } from '@findeg/db/connection';
import {
  productVariants,
  variantImages,
  variantAttributes,
  attributes as attributeTable,
} from '@findeg/db/schema';
import {
  IVariantRepository,
} from '../../application/interfaces/IVariantRepository';
import { Variant } from '../../domain/entities/Variant';
import { VariantInput } from '../../../administration/domain/types/ProductInput';
import { InferSelectModel, and, eq, inArray } from 'drizzle-orm';
import { ID, CurrencyCode } from '../../../core/domain/types/common';

type VariantDB = InferSelectModel<typeof productVariants>;
type VariantImageDB = InferSelectModel<typeof variantImages>;

interface VariantAttributeRow {
  variantId: number;
  attributeId: number;
  key: string;
  valueText: string | null;
}

/**
 * Drizzle Variant Repository
 *
 * Implements SKU-level data access, pricing resolution, and UOM management.
 */
export class DrizzleVariantRepository implements IVariantRepository {
  private mapToDomain(
    v: VariantDB,
    images: VariantImageDB[] = [],
    attrs: VariantAttributeRow[] = [],
  ): Variant {
    return {
      id: v.id,
      productId: v.productId,
      sku: v.sku,
      variantKey: v.variantKey,
      localizedLabel: (v.localizedLabel as { en: string; ar: string }) || { en: '', ar: '' },
      sortOrder: v.sortOrder,
      isDefault: v.isDefault,
      mediaSet: v.mediaSet as any,
      isActive: v.isActive,
      basePrice: Number(v.basePrice),
      strikePrice: v.strikePrice ? Number(v.strikePrice) : undefined,
      costPrice: v.costPrice ? Number(v.costPrice) : undefined,
      weightGrams: v.weightGrams ? Number(v.weightGrams) : undefined,
      barcode: v.barcode || undefined,
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
      })),
    };
  }

  async getByProductId(productId: ID): Promise<Variant[]> {
    const variantRows = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(productVariants.sortOrder);

    if (variantRows.length === 0) return [];

    const variantIds = variantRows.map((v) => v.id);

    const [images, attrs] = await Promise.all([
      db
        .select()
        .from(variantImages)
        .where(inArray(variantImages.variantId, variantIds))
        .orderBy(variantImages.displayOrder),
      db
        .select({
          variantId: variantAttributes.variantId,
          attributeId: variantAttributes.attributeId,
          key: attributeTable.key,
          valueText: variantAttributes.valueText,
        })
        .from(variantAttributes)
        .innerJoin(attributeTable, eq(variantAttributes.attributeId, attributeTable.id))
        .where(inArray(variantAttributes.variantId, variantIds)),
    ]);

    return variantRows.map((v) => {
      const vImages = images.filter((img) => img.variantId === v.id);
      const vAttrs = attrs.filter((a) => a.variantId === v.id);
      return this.mapToDomain(v, vImages, vAttrs);
    });
  }

  async getById(variantId: ID): Promise<Variant | null> {
    const [v] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);

    if (!v) return null;

    const [images, attrs] = await Promise.all([
      db
        .select()
        .from(variantImages)
        .where(eq(variantImages.variantId, variantId))
        .orderBy(variantImages.displayOrder),
      db
        .select({
          variantId: variantAttributes.variantId,
          attributeId: variantAttributes.attributeId,
          key: attributeTable.key,
          valueText: variantAttributes.valueText,
        })
        .from(variantAttributes)
        .innerJoin(attributeTable, eq(variantAttributes.attributeId, attributeTable.id))
        .where(eq(variantAttributes.variantId, variantId)),
    ]);

    return this.mapToDomain(v, images, attrs);
  }

  async getBySku(sku: string): Promise<Variant | null> {
    const [v] = await db
      .select({ id: productVariants.id })
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
          localizedLabel: input.localizedLabel || { en: '' },
          sortOrder: input.sortOrder || 0,
          isDefault: input.isDefault || false,
          mediaSet: input.mediaSet,
          isActive: input.isActive ?? true,
          basePrice: String(input.basePrice),
          strikePrice: input.strikePrice ? String(input.strikePrice) : null,
          costPrice: input.costPrice ? String(input.costPrice) : null,
          weightGrams: input.weightGrams,
          barcode: input.barcode,
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
          })),
        );
      }

      const hydrated = await this.getById(newVariant.id);
      if (!hydrated) throw new Error('Failed to retrieve created variant');
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
          sortOrder: input.sortOrder,
          isDefault: input.isDefault,
          mediaSet: input.mediaSet,
          isActive: input.isActive,
          basePrice: input.basePrice ? String(input.basePrice) : undefined,
          strikePrice: input.strikePrice ? String(input.strikePrice) : undefined,
          costPrice: input.costPrice ? String(input.costPrice) : undefined,
          weightGrams: input.weightGrams,
          barcode: input.barcode,
          updatedAt: new Date(),
        })
        .where(eq(productVariants.id, variantId));

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
            })),
          );
        }
      }

      const hydrated = await this.getById(variantId);
      if (!hydrated) throw new Error('Failed to retrieve updated variant');
      return hydrated;
    });
  }

  async delete(variantId: ID): Promise<void> {
    await db.delete(productVariants).where(eq(productVariants.id, variantId));
  }
}

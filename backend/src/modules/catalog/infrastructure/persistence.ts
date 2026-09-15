import { and, eq, inArray } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import {
  productVariants,
  products,
  brands,
  attributes,
  productAttributes,
  variantAttributes,
} from '@findeg/db/modules/catalog';
import type { CatalogStore, CatalogCheckoutStore, CatalogListStore } from '../public.js';

export function bindCatalogCheckoutStore(database: TransactionDatabase): CatalogCheckoutStore {
  return {
    async readEligible(ids) {
      if (!ids.length) return [];
      return database
        .select({
          id: productVariants.id,
          sku: productVariants.sku,
          name: products.localizedName,
          label: productVariants.localizedLabel,
          price: productVariants.basePrice,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(
          and(
            inArray(productVariants.id, [...ids]),
            eq(productVariants.isActive, true),
            eq(products.isActive, true),
          ),
        )
        .orderBy(products.id, productVariants.id)
        .for('share');
    },
  };
}

export function bindCatalogStore(database: TransactionDatabase): CatalogStore {
  return {
    async createActiveVariant(input) {
      const [product] = await database
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.id, input.productId), eq(products.isActive, true)))
        .for('update');
      if (!product) return undefined;
      const [variant] = await database
        .insert(productVariants)
        .values({
          productId: input.productId,
          sku: input.sku.trim(),
          variantKey: input.variantKey.trim(),
          localizedLabel: input.label,
          basePrice: input.basePrice,
          strikePrice: input.strikePrice,
          isActive: true,
        })
        .returning({ id: productVariants.id });
      return variant.id;
    },
    async updateActiveVariant(input) {
      const [variant] = await database
        .select({ id: productVariants.id })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(and(eq(productVariants.id, input.variantId), eq(products.isActive, true)))
        .for('update');
      if (!variant) return false;
      await database
        .update(productVariants)
        .set({
          sku: input.sku.trim(),
          variantKey: input.variantKey.trim(),
          localizedLabel: input.label,
          basePrice: input.basePrice,
          strikePrice: input.strikePrice,
          isActive: input.isActive,
          updatedAt: new Date(),
        })
        .where(eq(productVariants.id, input.variantId));
      return true;
    },
    async hasActiveVariant(variantId) {
      const [variant] = await database
        .select({ id: productVariants.id })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(
          and(
            eq(productVariants.id, variantId),
            eq(productVariants.isActive, true),
            eq(products.isActive, true),
          ),
        )
        .for('update');
      return !!variant;
    },
    async isDefaultVariant(variantId) {
      const [variant] = await database
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(and(eq(productVariants.id, variantId), eq(productVariants.isDefault, true)));
      return !!variant;
    },
    async listActiveVariants() {
      const rows = await database
        .select({
          id: productVariants.id,
          sku: productVariants.sku,
          name: products.localizedName,
          label: productVariants.localizedLabel,
          price: productVariants.basePrice,
          strikePrice: productVariants.strikePrice,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(and(eq(productVariants.isActive, true), eq(products.isActive, true)))
        .orderBy(products.id, productVariants.sortOrder, productVariants.id);
      return rows.map((row) => ({
        id: row.id,
        sku: row.sku,
        name: row.name,
        label: row.label,
        price: row.price,
        strikePrice: row.strikePrice ?? undefined,
      }));
    },
    async listVariants() {
      const rows = await database
        .select({
          id: productVariants.id,
          productId: productVariants.productId,
          productName: products.localizedName,
          sku: productVariants.sku,
          variantKey: productVariants.variantKey,
          label: productVariants.localizedLabel,
          basePrice: productVariants.basePrice,
          strikePrice: productVariants.strikePrice,
          isActive: productVariants.isActive,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(eq(products.isActive, true))
        .orderBy(products.id, productVariants.sortOrder, productVariants.id);
      return rows.map((row) => ({
        ...row,
        productName: {
          en: row.productName.en ?? '',
          ar: row.productName.ar ?? '',
        },
        label: {
          en: row.label.en ?? '',
          ar: row.label.ar ?? '',
        },
        basePrice: row.basePrice,
        strikePrice: row.strikePrice ?? undefined,
      }));
    },
  };
}

export function bindCatalogListStore(database: TransactionDatabase): CatalogListStore {
  return {
    async readEligible() {
      const rows = await database
        .select({
          id: productVariants.id,
          productId: products.id,
          categoryId: products.categoryId,
          brandId: products.brandId,
          sku: productVariants.sku,
          name: products.localizedName,
          label: productVariants.localizedLabel,
          price: productVariants.basePrice,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(and(eq(productVariants.isActive, true), eq(products.isActive, true)))
        .orderBy(products.id, productVariants.id)
        .for('share');
      if (!rows.length) return [];
      const brandRows = await database.select().from(brands).for('share');
      const definitions = await database.select().from(attributes).for('share');
      const productValues = await database
        .select()
        .from(productAttributes)
        .where(
          inArray(
            productAttributes.productId,
            rows.map((row) => row.productId),
          ),
        )
        .for('share');
      const variantValues = await database
        .select()
        .from(variantAttributes)
        .where(
          inArray(
            variantAttributes.variantId,
            rows.map((row) => row.id),
          ),
        )
        .for('share');
      return rows.map((row) => {
        const values: Record<string, string> = {};
        const assignments = [
          ...productValues.filter((value) => value.productId === row.productId),
          ...variantValues.filter((value) => value.variantId === row.id),
        ];
        for (const definition of definitions) {
          const specified = assignments
            .filter((value) => value.attributeId === definition.id)
            .map((value) => value.valueText);
          if (
            specified.length &&
            specified.every((value) => value !== null && value === specified[0])
          )
            values[definition.key] = specified[0]!;
        }
        return {
          ...row,
          brand: brandRows.find((brand) => brand.id === row.brandId)?.localizedName ?? {},
          attributes: values,
        };
      });
    },
  };
}

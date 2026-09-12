import { and, eq } from 'drizzle-orm';
import type { TransactionDatabase } from '@findeg/db/transactions';
import { productVariants, products } from '@findeg/db/modules/catalog';
import type { CatalogStore } from '../public.js';

function localized(value: { en?: string; ar?: string }, locale: 'en' | 'ar') {
  return value[locale] ?? value.en ?? value.ar ?? '';
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
          isActive: input.isActive,
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
    async listActiveVariants(locale) {
      const rows = await database
        .select({
          id: productVariants.id,
          sku: productVariants.sku,
          name: products.localizedName,
          label: productVariants.localizedLabel,
          price: productVariants.basePrice,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .where(and(eq(productVariants.isActive, true), eq(products.isActive, true)))
        .orderBy(products.id, productVariants.sortOrder, productVariants.id);
      return rows.map((row) => ({
        id: row.id,
        sku: row.sku,
        name: localized(row.name, locale),
        label: localized(row.label, locale),
        price: row.price,
      }));
    },
  };
}

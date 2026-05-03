import { and, eq, inArray, sql, asc, desc, ilike, or, count, InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  products,
  productVariants,
  brands,
  categories,
  tags,
  productTags,
  attributeDefinitions,
  variantAttributes,
} from '@findeg/db/schema';
import { type Product } from '../../domain/entities/Product';
import { type Variant } from '../../domain/entities/Variant';
import {
  type IProductRepository,
  type ProductFilters,
} from '../../application/interfaces/IProductRepository';
import {
  type TranslationMap,
  type Locale,
  parse,
  asTranslationMap,
  pick,
} from '../../../core/domain/value-objects';
import { BaseDrizzleRepository } from '../../../core/infrastructure/persistence/BaseDrizzleRepository';
import { type Tag } from '../../domain/entities/Tag';
import { type ProductAttributeValue } from '../../domain/entities/AttributeDefinition';

/**
 * Drizzle Product Repository
 *
 * Implements catalog persistence using Drizzle ORM and JSONB localization.
 */
export class DrizzleProductRepository
  extends BaseDrizzleRepository<typeof products, Product, number>
  implements IProductRepository
{
  constructor() {
    super(products);
  }

  protected mapToDomain(
    dbProduct: InferSelectModel<typeof products>,
    variants: Variant[] = [],
    categoryName?: string,
    brandName?: string,
    tags: Tag[] = [],
    attributes: ProductAttributeValue[] = [],
    language: Locale = 'en',
  ): Product {
    const nameMap = asTranslationMap(dbProduct.localizedName);
    const descMap = asTranslationMap(dbProduct.localizedDescription);
    const longDescMap = asTranslationMap(dbProduct.localizedLongDescription);

    return {
      id: dbProduct.id,
      sku: dbProduct.sku || '',
      isActive: dbProduct.isActive,
      brandId: dbProduct.brandId ?? undefined,
      categoryId: dbProduct.categoryId ?? undefined,
      brandName,
      categoryName,
      // Resolved strings
      name: pick(nameMap, language),
      description: pick(descMap, language),
      longDescription: pick(longDescMap, language),
      slug: dbProduct.slug || '',
      // Localized JSONB
      localizedName: nameMap,
      localizedDescription: descMap,
      localizedLongDescription: longDescMap,
      // Metadata
      rating: 0,
      reviewsCount: 0,
      variants,
      tags,
      attributes,
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  }

  async getAll(language?: Locale): Promise<Product[]> {
    const lang = parse(language);
    const results = await this.db
      .select({ product: products, brand: brands, category: categories })
      .from(products)
      .leftJoin(brands, eq(brands.id, products.brandId))
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .orderBy(asc(products.id));

    if (results.length === 0) return [];
    const productIds = results.map((r) => r.product.id);
    const variantsMap = await this.getHydratedVariants(productIds, lang);

    return results.map((row) => {
      const catName = pick(asTranslationMap(row.category?.localizedName), lang);
      return this.mapToDomain(
        row.product,
        variantsMap[row.product.id] || [],
        catName,
        row.brand?.name,
        [],
        [],
        lang,
      );
    });
  }

  async getById(id: number, language?: Locale): Promise<Product | null> {
    const lang = parse(language);
    const results = await this.db
      .select({ product: products, brand: brands, category: categories })
      .from(products)
      .leftJoin(brands, eq(brands.id, products.brandId))
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .where(eq(products.id, id))
      .limit(1);

    if (results.length === 0) return null;
    const variants = await this.getHydratedVariants([id], lang);
    const tagsData = await this.getProductTags(id, lang);
    const attrs = await this.getProductAttributes(id, lang);

    const catNameMap = (results[0].category?.localizedName as Record<string, string>) || {};
    const catName = catNameMap[lang] || catNameMap['en'];

    return this.mapToDomain(
      results[0].product,
      variants[id] || [],
      catName,
      results[0].brand?.name,
      tagsData,
      attrs,
      lang,
    );
  }

  async getBySlug(slug: string, language?: Locale): Promise<Product | null> {
    const lang = parse(language);
    const results = await this.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    return results.length === 0 ? null : this.getById(results[0].id, lang);
  }

  async getFeatured(limit = 10, language?: Locale): Promise<Product[]> {
    const lang = parse(language);
    const results = await this.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt))
      .limit(limit);
    if (results.length === 0) return [];
    const all = await Promise.all(results.map((r) => this.getById(r.id, lang)));
    return all.filter((p): p is Product => p !== null);
  }

  async search(query: string, language?: Locale): Promise<Product[]> {
    const lang = parse(language);
    const results = await this.db
      .select({ id: products.id })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          or(
            ilike(products.sku, `%${query}%`),
            sql`${products.localizedName}->>${lang} ILIKE ${`%${query}%`}`,
          ),
        ),
      )
      .limit(20);

    if (results.length === 0) return [];
    const all = await Promise.all(results.map((r) => this.getById(r.id, lang)));
    return all.filter((p): p is Product => p !== null);
  }

  async getByCategory(categoryId: number, language?: Locale): Promise<Product[]> {
    const lang = parse(language);
    const results = await this.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .limit(50);
    if (results.length === 0) return [];
    const all = await Promise.all(results.map((r) => this.getById(r.id, lang)));
    return all.filter((p): p is Product => p !== null);
  }

  async getByBrand(brandId: number, language?: Locale): Promise<Product[]> {
    const lang = parse(language);
    const results = await this.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.brandId, brandId))
      .limit(50);
    if (results.length === 0) return [];
    const all = await Promise.all(results.map((r) => this.getById(r.id, lang)));
    return all.filter((p): p is Product => p !== null);
  }

  async getFiltered(
    filters: ProductFilters,
    language?: Locale,
  ): Promise<{ products: Product[]; total: number }> {
    const lang = parse(language);
    const conditions = [];
    if (filters.isActive !== undefined) conditions.push(eq(products.isActive, filters.isActive));
    if (filters.categoryId) conditions.push(eq(products.categoryId, Number(filters.categoryId)));
    if (filters.brandId) conditions.push(eq(products.brandId, Number(filters.brandId)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const totalResults = await this.db.select({ count: count() }).from(products).where(where);
    const total = Number(totalResults[0].count);

    if (total === 0) return { products: [], total: 0 };
    const data = await this.db
      .select({ product: products, brand: brands })
      .from(products)
      .leftJoin(brands, eq(brands.id, products.brandId))
      .where(where)
      .offset(filters.offset || 0)
      .limit(filters.limit || 20)
      .orderBy(desc(products.id));
    const productIds = data.map((r) => r.product.id);
    const variantsMap = await this.getHydratedVariants(productIds, lang);
    return {
      total,
      products: data.map((row) =>
        this.mapToDomain(
          row.product,
          variantsMap[row.product.id] || [],
          undefined,
          row.brand?.name,
          [],
          [],
          lang,
        ),
      ),
    };
  }

  async count(filters?: ProductFilters): Promise<number> {
    const conditions = [];
    if (filters?.isActive !== undefined) conditions.push(eq(products.isActive, filters.isActive));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const results = await this.db.select({ value: count() }).from(products).where(where);
    return Number(results[0].value);
  }

  // Administrative Operations
  async create(input: InferInsertModel<typeof products>): Promise<Product> {
    const [newProduct] = await this.db
      .insert(products)
      .values({
        sku: input.sku,
        slug: input.slug,
        isActive: input.isActive ?? true,
        categoryId: input.categoryId,
        brandId: input.brandId,
        localizedName: input.localizedName || {},
        localizedDescription: input.localizedDescription || {},
      })
      .returning({ id: products.id });

    return this.getById(newProduct.id) as Promise<Product>;
  }

  async update(id: number, input: Partial<InferInsertModel<typeof products>>): Promise<Product> {
    await this.db.update(products).set(input).where(eq(products.id, id));
    return this.getById(id) as Promise<Product>;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(products).where(eq(products.id, id));
  }

  // Hydration Helpers
  private async getHydratedVariants(
    productIds: number[],
    _language: Locale,
  ): Promise<Record<number, Variant[]>> {
    if (productIds.length === 0) return {};
    const rows = await this.db
      .select({ variant: productVariants })
      .from(productVariants)
      .where(inArray(productVariants.productId, productIds));

    const map: Record<number, Variant[]> = {};
    for (const row of rows) {
      const pid = row.variant.productId;
      if (!map[pid]) map[pid] = [];
      const labelMap = (row.variant.localizedLabel as TranslationMap) || { en: '', ar: '' };
      map[pid].push({
        id: row.variant.id,
        productId: pid,
        sku: row.variant.sku,
        variantKey: row.variant.variantKey,
        localizedLabel: labelMap,
        basePrice: String(row.variant.basePrice),
        strikePrice: row.variant.strikePrice ? String(row.variant.strikePrice) : undefined,
        costPrice: row.variant.costPrice ? String(row.variant.costPrice) : undefined,
        isActive: row.variant.isActive,
        displayOrder: row.variant.displayOrder,
        lowStockThreshold: row.variant.lowStockThreshold,
        barcode: row.variant.barcode || undefined,
        weightGrams: row.variant.weightGrams || undefined,
        images: [],
        attributes: [],
      });
    }
    return map;
  }

  private async getProductTags(productId: number, _language: Locale): Promise<Tag[]> {
    const results = await this.db
      .select({ tag: tags })
      .from(productTags)
      .innerJoin(tags, eq(tags.id, productTags.tagId))
      .where(eq(productTags.productId, productId));
    return results.map((r) => r.tag as Tag);
  }

  private async getProductAttributes(
    productId: number,
    _language: Locale,
  ): Promise<ProductAttributeValue[]> {
    const results = await this.db
      .select({
        attributeId: attributeDefinitions.id,
        key: attributeDefinitions.key,
        valueText: variantAttributes.valueText,
        valueNum: variantAttributes.valueNum,
        valueBool: variantAttributes.valueBool,
      })
      .from(variantAttributes)
      .innerJoin(attributeDefinitions, eq(attributeDefinitions.id, variantAttributes.attributeId))
      .innerJoin(productVariants, eq(productVariants.id, variantAttributes.variantId))
      .where(eq(productVariants.productId, productId));

    return results.map((r) => ({
      attributeId: r.attributeId,
      key: r.key,
      valueText: r.valueText || undefined,
      valueNum: r.valueNum ? Number(r.valueNum) : undefined,
      valueBool: r.valueBool ?? undefined,
    })) as ProductAttributeValue[];
  }

  async getLowStockProducts(threshold?: number, language: Locale = 'ar'): Promise<Product[]> {
    const data = await this.db.select().from(products).limit(5);
    const all = await Promise.all(data.map((p) => this.getById(p.id, language)));
    return all.filter((p): p is Product => p !== null);
  }

  async checkSkuAvailable(sku: string, excludeId?: number): Promise<boolean> {
    const results = await this.db
      .select({ id: products.id })
      .from(products)
      .where(
        and(eq(products.sku, sku), excludeId ? sql`${products.id} != ${excludeId}` : sql`TRUE`),
      )
      .limit(1);
    return results.length === 0;
  }

  async checkSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    const results = await this.db
      .select({ id: products.id })
      .from(products)
      .where(
        and(eq(products.slug, slug), excludeId ? sql`${products.id} != ${excludeId}` : sql`TRUE`),
      )
      .limit(1);
    return results.length === 0;
  }
}

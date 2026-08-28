import { ID } from '@findeg/backend/features/core/domain/types/common';
import { type ProductFilters } from '../interfaces/IProductRepository';
import { type IProductService } from '../interfaces/IProductService';
import { type Product } from '@findeg/backend/features/catalog/domain/entities/Product';
import { type Variant } from '@findeg/backend/features/catalog/domain/entities/Variant';
import { type Locale } from '@findeg/backend/features/core/domain/value-objects';
import type { ProductInput } from '../dtos/ProductInput';
import { productQueries } from '@findeg/db/queries';
import {
  asTranslationMap,
  pick,
  parse,
  type TranslationMap,
} from '../../../core/domain/value-objects';
import { Tag } from '../../domain/entities/Tag';
import { type ProductAttributeValue } from '../../domain/entities/Attribute';

export class ProductService implements IProductService {
  private async mapToDomain(
    dbProduct: Awaited<ReturnType<typeof productQueries.getById>>,
    variants: Variant[] = [],
    categoryName?: string,
    brandName?: string,
    tags: Tag[] = [],
    attributes: ProductAttributeValue[] = [],
    language: Locale = 'en',
    hydratedDefaultVariant?: Variant,
  ): Promise<Product | null> {
    if (!dbProduct) return null;

    const nameMap = asTranslationMap(dbProduct.localizedName);
    const descMap = asTranslationMap(dbProduct.localizedDescription);
    const longDescMap = asTranslationMap(dbProduct.localizedLongDescription);

    return {
      id: dbProduct.id,
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
      hydratedDefaultVariant,
      variants,
      tags,
      attributes,
      createdAt: dbProduct.createdAt,
      updatedAt: dbProduct.updatedAt,
    };
  }

  private mapVariantToDomain(dbVariant: Awaited<ReturnType<typeof productQueries.getVariantsByProductIds>>[number][number]): Variant {
    const labelMap = (dbVariant.localizedLabel as TranslationMap) || { en: '', ar: '' };
    return {
      id: dbVariant.id,
      productId: dbVariant.productId,
      sku: dbVariant.sku,
      variantKey: dbVariant.variantKey,
      localizedLabel: labelMap,
      basePrice: String(dbVariant.basePrice),
      strikePrice: dbVariant.strikePrice ? String(dbVariant.strikePrice) : undefined,
      costPrice: dbVariant.costPrice ? String(dbVariant.costPrice) : undefined,
      isActive: dbVariant.isActive,
      sortOrder: dbVariant.sortOrder,
      isDefault: dbVariant.isDefault,
      mediaSet: dbVariant.mediaSet as any,
      barcode: dbVariant.barcode || undefined,
      weightGrams: dbVariant.weightGrams || undefined,
      images: [],
      attributes: [],
    };
  }

  private mapTagToDomain(dbTag: Awaited<ReturnType<typeof productQueries.getProductTags>>[number]): Tag {
    return {
      id: dbTag.id,
      key: dbTag.key,
      slug: dbTag.slug || '',
      group: dbTag.group,
      icon: dbTag.icon || undefined,
      color: dbTag.color || undefined,
      isActive: dbTag.isActive,
      scope: (dbTag.scope as 'catalog' | 'school' | 'campaign' | 'system' | 'search' | 'editorial') || 'catalog',
      createdAt: dbTag.createdAt,
      updatedAt: dbTag.updatedAt,
    };
  }

  async getAll(language?: Locale): Promise<Product[]> {
    const lang = parse(language);
    const results = await productQueries.getAllWithBrandAndCategory();

    if (results.length === 0) return [];

    const productIds = results.map((r) => r.product.id);
    const variantsMap = await productQueries.getVariantsByProductIds(productIds);

    const products: Product[] = [];
    for (const row of results) {
      const productVariantsList = (variantsMap[row.product.id] || []).map((v) => this.mapVariantToDomain(v));
      const defaultVariant = productVariantsList.find((v) => v.isDefault) || productVariantsList[0];

      const catName = row.category ? pick(asTranslationMap(row.category.localizedName ?? { en: '' }), lang) : undefined;
      const brandNameStr = row.brand ? pick(asTranslationMap(row.brand.localizedName ?? {}), lang) : undefined;

      const domain = await this.mapToDomain(
        row.product,
        productVariantsList,
        catName,
        brandNameStr,
        [],
        [],
        lang,
        defaultVariant,
      );

      if (domain) products.push(domain);
    }

    return products;
  }

  async getById(id: ID, language?: Locale): Promise<Product | null> {
    const lang = parse(language);
    const result = await productQueries.getByIdWithBrandAndCategory(id as number);

    if (!result) return null;

    const variants = await productQueries.getVariantsByProductIds([id as number]);
    const tagsData = await productQueries.getProductTags(id as number);
    const attrs = await productQueries.getProductAttributes(id as number);

    const productVariantsList = (variants[id as number] || []).map((v) => this.mapVariantToDomain(v));
    const defaultVariant = productVariantsList.find((v) => v.isDefault) || productVariantsList[0];

    const catName = result.category ? pick(asTranslationMap(result.category.localizedName ?? { en: '' }), lang) : undefined;
    const brandNameStr = result.brand ? pick(asTranslationMap(result.brand.localizedName ?? {}), lang) : undefined;
    const tags = tagsData.map((t) => this.mapTagToDomain(t));

    return this.mapToDomain(
      result.product,
      productVariantsList,
      catName,
      brandNameStr,
      tags,
      attrs,
      lang,
      defaultVariant,
    );
  }

  async getBySlug(slug: string, language?: Locale): Promise<Product | null> {
    const lang = parse(language);
    const product = await productQueries.getBySlug(slug);

    if (!product) return null;

    return this.getById(product.id, lang);
  }

  async getFeaturedProducts(limit: number = 8, language?: Locale): Promise<Product[]> {
    const lang = parse(language);
    const results = await productQueries.getFeatured(limit);

    if (results.length === 0) return [];

    const all = await Promise.all(results.map((r) => this.getById(r.id, lang)));
    return all.filter((p): p is Product => p !== null);
  }

  async searchProducts(query: string, language?: Locale): Promise<Product[]> {
    const lang = parse(language);
    const results = await productQueries.search(query, lang);

    if (results.length === 0) return [];

    const all = await Promise.all(results.map((r) => this.getById(r.id, lang)));
    return all.filter((p): p is Product => p !== null);
  }

  async getByCategory(categoryId: ID, language?: Locale): Promise<Product[]> {
    const lang = parse(language);
    const results = await productQueries.getByCategory(categoryId as number);

    if (results.length === 0) return [];

    const all = await Promise.all(results.map((r) => this.getById(r.id, lang)));
    return all.filter((p): p is Product => p !== null);
  }

  async getRelatedProducts(
    product: Product,
    limit: number = 4,
    language?: Locale,
  ): Promise<Product[]> {
    const { products } = await this.getFilteredProducts(
      {
        categoryId: product.categoryId,
        limit: limit + 5,
        isActive: true,
      },
      language,
    );

    return products.filter((p) => p.id !== product.id).slice(0, limit);
  }

  async getTopSellingProducts(limit: number = 4, language?: Locale): Promise<Product[]> {
    const { products } = await this.getFilteredProducts(
      {
        limit,
        isActive: true,
      },
      language,
    );

    return products;
  }

  async getFilteredProducts(
    filters: ProductFilters,
    language?: Locale,
  ): Promise<{ products: Product[]; total: number }> {
    const lang = parse(language);
    const { products, total } = await productQueries.getFiltered({
      isActive: filters.isActive,
      categoryId: filters.categoryId,
      brandId: filters.brandId,
      offset: filters.offset,
      limit: filters.limit,
    });

    if (products.length === 0) return { products: [], total: 0 };

    const all = await Promise.all(products.map((r) => this.getById(r.id, lang)));
    return {
      products: all.filter((p): p is Product => p !== null),
      total,
    };
  }

  async create(input: ProductInput): Promise<Product> {
    const localizedName = Object.fromEntries(input.translations.map((t) => [t.language, t.name]));
    const localizedDescription = Object.fromEntries(
      input.translations.map((t) => [t.language, t.description]),
    );
    const localizedLongDescription = Object.fromEntries(
      input.translations.map((t) => [t.language, t.longDescription]),
    );

    const newProduct = await productQueries.create({
      isActive: input.isActive ?? true,
      categoryId: input.categoryId,
      brandId: input.brandId,
      localizedName: asTranslationMap(localizedName),
      localizedDescription: asTranslationMap(localizedDescription),
      localizedLongDescription: asTranslationMap(localizedLongDescription),
    });

    const result = await this.getById(newProduct.id);
    if (!result) throw new Error(`Failed to retrieve created product ${newProduct.id}`);

    return result;
  }

  async update(id: ID, input: ProductInput): Promise<Product> {
    const localizedName = Object.fromEntries(input.translations.map((t) => [t.language, t.name]));
    const localizedDescription = Object.fromEntries(
      input.translations.map((t) => [t.language, t.description]),
    );
    const localizedLongDescription = Object.fromEntries(
      input.translations.map((t) => [t.language, t.longDescription]),
    );

    await productQueries.update(id as number, {
      isActive: input.isActive,
      categoryId: input.categoryId,
      brandId: input.brandId,
      localizedName: asTranslationMap(localizedName),
      localizedDescription: asTranslationMap(localizedDescription),
      localizedLongDescription: asTranslationMap(localizedLongDescription),
    });

    const result = await this.getById(id);
    if (!result) throw new Error(`Failed to retrieve updated product ${id}`);

    return result;
  }

  async delete(id: ID): Promise<void> {
    await productQueries.deleteProduct(id as number);
  }
}


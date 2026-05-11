import type { getAdminProductForEditRaw, getAdminProductsListRaw } from '@findeg/db/queries';
import type {
  ProductEditData,
  ProductListItem,
  ProductListResult,
} from '../../interfaces/IAdminProductService';
import type { CreateVariantInput } from '../../dtos/VariantInput';
import type { VariantDimension } from '../../../../catalog/domain/types/VariantDimension';
import { VariantKey } from '../../../../catalog/domain/value-objects/VariantKey';
import { Sku } from '../../../../catalog/domain/value-objects/Sku';
import { generateVariantMatrix } from '../../../../catalog/domain/types/VariantDimension';

type ProductListQueryResult = Awaited<ReturnType<typeof getAdminProductsListRaw>>;
type ProductListRow = ProductListQueryResult['rows'][number];
type ProductEditRaw = NonNullable<Awaited<ReturnType<typeof getAdminProductForEditRaw>>>;

export interface GeneratedProductVariantPayload {
  sku: string;
  variantKey: string;
  localizedLabel: { en: string; ar: string };
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
  basePrice: number;
  strikePrice?: number | null;
  costPrice?: number | null;
  weightGrams?: number | null;
  barcode?: string | null;
  attributes: Array<{ attributeKey: string; value: string }>;
}

export interface VariantKeyUpdatePayload {
  variantId: number;
  variantKey: string;
}

export function mapAdminProductListResult(result: ProductListQueryResult): ProductListResult {
  return {
    products: result.rows.map(mapAdminProductListItem),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  };
}

export function mapAdminProductEditData(data: ProductEditRaw): ProductEditData {
  return {
    ...data,
    rating: Number(data.rating),
    variants: data.variants.map((variant) => ({
      ...variant,
      basePrice: Number(variant.basePrice),
      strikePrice: variant.strikePrice ? Number(variant.strikePrice) : null,
      costPrice: variant.costPrice ? Number(variant.costPrice) : null,
      images: variant.images,
      attributes: variant.attributes.map((attribute) => ({
        ...attribute,
        key: attribute.definition?.key || '',
      })),
    })),
    tags: data.tags.map((productTag) => productTag.tag),
  } as unknown as ProductEditData;
}

export function buildGeneratedProductVariants(
  dimensions: VariantDimension[],
  defaults: Partial<CreateVariantInput>,
): GeneratedProductVariantPayload[] {
  const combinations = generateVariantMatrix(dimensions);

  return combinations.map((combination, index) => {
    const attributes = Object.entries(combination).map(([attributeKey, value]) => ({
      attributeKey,
      value,
    }));

    const variantKey = VariantKey.build(
      attributes.map(({ attributeKey, value }) => ({ key: attributeKey, value })),
    ).toString();

    const suggestedSku = Sku.suggestVariantSku(
      defaults.sku ?? 'SKU',
      attributes.map(({ value }) => value),
    );

    return {
      sku: defaults.sku ?? suggestedSku,
      variantKey,
      localizedLabel: defaults.localizedLabel ?? { en: '', ar: '' },
      sortOrder: index,
      isDefault: index === 0 && defaults.isDefault === undefined ? true : (defaults.isDefault ?? false),
      isActive: defaults.isActive ?? true,
      basePrice: defaults.basePrice ?? 0,
      strikePrice: defaults.strikePrice ?? null,
      costPrice: defaults.costPrice ?? null,
      weightGrams: defaults.weightGrams ?? null,
      barcode: defaults.barcode ?? null,
      attributes,
    };
  });
}

export function buildVariantKeyUpdates(
  rows: Array<{ variantId: number; key: string; valueText: string | null }>,
): VariantKeyUpdatePayload[] {
  const attributesByVariant = new Map<number, Array<{ key: string; valueText: string | null }>>();

  for (const row of rows) {
    const existing = attributesByVariant.get(row.variantId) ?? [];
    existing.push({ key: row.key, valueText: row.valueText });
    attributesByVariant.set(row.variantId, existing);
  }

  return Array.from(attributesByVariant.entries()).map(([variantId, attributes]) => ({
    variantId,
    variantKey: VariantKey.build(
      attributes.map((attribute) => ({ key: attribute.key, value: attribute.valueText ?? '' })),
    ).toString(),
  }));
}

function mapAdminProductListItem(row: ProductListRow): ProductListItem {
  let completeness: ProductListItem['completeness'] = 'complete';

  if (!row.categoryId) completeness = 'no-category';
  else if (!row.isActive) completeness = 'draft';
  else if (!row.hasImages) completeness = 'no-images';
  else if (!row.defaultVariantPrice || row.defaultVariantPrice === 0) completeness = 'no-price';

  return {
    ...row,
    sku: 'N/A',
    localizedName: {
      en: row.localizedName.en ?? '',
      ar: row.localizedName.ar ?? '',
    },
    completeness,
  };
}
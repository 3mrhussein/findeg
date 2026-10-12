import {
  isEligibleVariant,
  type CandidateVariant,
  type EligibilityItem as DomainEligibilityItem,
} from '@findeg/domain/school-lists';
import { domainId } from '@findeg/db';

export interface ItemSpecification {
  categoryId: number;
  /** Attribute key → required string value. */
  attributes: Record<string, string>;
}

export interface EligibilityItem {
  /** The item's default variant. */
  variantId: number;
  exactItem: boolean;
  specification: ItemSpecification | null;
}

export interface EligibilityCandidate {
  variantId: number;
  /** Omitted only for query projections that already select active variants/products. */
  variantActive?: boolean;
  productActive?: boolean;
  /** Category of the variant's product. */
  categoryId: number | null;
  /** Attribute key → string value. */
  attributes: Record<string, string>;
}

/** Maps the existing application projection to the domain eligibility contract. */
export function toEligibilityItem(item: EligibilityItem): DomainEligibilityItem {
  return {
    defaultVariantId: domainId<'ProductVariant'>(item.variantId),
    specification:
      item.exactItem || !item.specification
        ? null
        : {
            categoryId: domainId<'Category'>(item.specification.categoryId),
            attributes: item.specification.attributes,
          },
  };
}

export function toCandidateVariant(candidate: EligibilityCandidate): CandidateVariant {
  return {
    id: domainId<'ProductVariant'>(candidate.variantId),
    attributes: candidate.attributes,
    status: candidate.variantActive === false ? 'inactive' : 'active',
    product: {
      // A missing category cannot match a specification; Exact Items do not inspect it.
      categoryId: candidate.categoryId as CandidateVariant['product']['categoryId'],
      status: candidate.productActive === false ? 'inactive' : 'active',
    },
  };
}

/** Compatibility entry for list reads and checkout; the domain owns every eligibility rule. */
export function eligibleVariants<C extends EligibilityCandidate>(
  item: EligibilityItem,
  candidates: readonly C[],
): C[] {
  const domainItem = toEligibilityItem(item);
  return candidates.filter((candidate) =>
    isEligibleVariant(domainItem, toCandidateVariant(candidate)),
  );
}

import type { ActiveStatus } from '../common';
import type { CategoryId, VariantId } from '../catalog';
import type { ItemSpecification } from './index';

/** What eligibility needs to know of a product variant: its own facts and its product's. */
export interface CandidateVariant {
  id: VariantId;
  /** Attribute key → value of the variant. */
  attributes: Readonly<Record<string, string>>;
  status: ActiveStatus;
  product: { categoryId: CategoryId; status: ActiveStatus };
}

/** The parts of a School Supply List Item that decide which variants it accepts. */
export interface EligibilityItem {
  defaultVariantId: VariantId | null;
  specification: ItemSpecification | null;
}

const isActive = (candidate: CandidateVariant) =>
  candidate.status === 'active' && candidate.product.status === 'active';

function matchesSpecification(candidate: CandidateVariant, specification: ItemSpecification) {
  return (
    candidate.product.categoryId === specification.categoryId &&
    Object.entries(specification.attributes).every(
      ([key, value]) =>
        Object.hasOwn(candidate.attributes, key) && candidate.attributes[key] === value,
    )
  );
}

/** Whether an item accepts a variant. See {@link eligibleVariants}. */
export function isEligibleVariant(item: EligibilityItem, candidate: CandidateVariant): boolean {
  if (!isActive(candidate)) return false;
  if (item.specification === null) return candidate.id === item.defaultVariantId;
  return matchesSpecification(candidate, item.specification);
}

/**
 * The variants a School Supply List Item accepts (ADR-0004, CA-4). An inactive variant, or a
 * variant of an inactive product, is never eligible. An Exact Item accepts only its default
 * variant. Otherwise the variant's product must be in the specification's category exactly (a
 * child category does not match) and the variant must carry every specified attribute with an
 * equal, case-sensitive value; extra attributes are fine and no attributes match the whole
 * category.
 */
export function eligibleVariants<C extends CandidateVariant>(
  item: EligibilityItem,
  candidates: readonly C[],
): C[] {
  return candidates.filter((candidate) => isEligibleVariant(item, candidate));
}

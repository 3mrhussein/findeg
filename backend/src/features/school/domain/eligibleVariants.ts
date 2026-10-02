/**
 * The one rule for which product variants a School Supply List Item accepts
 * (ADR-0004). Shared by the list read and, later, checkout, so both agree.
 */

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
  /** Category of the variant's product. */
  categoryId: number | null;
  /** Attribute key → string value. */
  attributes: Record<string, string>;
}

/**
 * Candidates are expected to be active variants of active products already.
 * An Exact Item, or an item without a specification (fails closed), accepts
 * only its default variant. Otherwise the variant's category must equal the
 * specification's exactly (a child category does not match) and it must carry
 * every specified attribute with an equal value; extra attributes are fine.
 */
export function eligibleVariants<C extends EligibilityCandidate>(
  item: EligibilityItem,
  candidates: readonly C[],
): C[] {
  const { specification } = item;
  if (item.exactItem || !specification) {
    return candidates.filter((c) => c.variantId === item.variantId);
  }
  const required = Object.entries(specification.attributes);
  return candidates.filter(
    (c) =>
      c.categoryId === specification.categoryId &&
      required.every(
        ([key, value]) => Object.hasOwn(c.attributes, key) && c.attributes[key] === value,
      ),
  );
}

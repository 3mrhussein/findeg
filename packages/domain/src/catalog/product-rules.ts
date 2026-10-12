import type { Tag } from './index';

/** The key of the tag that marks a product as a New Arrival (seeded in the `campaign` group). */
export const NEW_ARRIVAL_TAG_KEY = 'new-arrival';

/** A product is a New Arrival when it carries the `new-arrival` tag. Its age plays no part. */
export function isNewArrival(productTags: readonly Pick<Tag, 'key'>[]): boolean {
  return productTags.some((tag) => tag.key === NEW_ARRIVAL_TAG_KEY);
}

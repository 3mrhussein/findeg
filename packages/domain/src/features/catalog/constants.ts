import type { TagScope } from './types';

/** Where a Tag applies. A tag is a catalogue tag unless it says otherwise. */
export const TAG_SCOPES = [
  'catalog',
  'school',
  'campaign',
  'system',
  'search',
  'editorial',
] as const;
export const DEFAULT_TAG_SCOPE: TagScope = 'catalog';

export const ATTRIBUTE_DATA_TYPES = ['string', 'number', 'boolean', 'enum'] as const;

/** The key of the tag that marks a product as a New Arrival (seeded in the `campaign` group). */
export const NEW_ARRIVAL_TAG_KEY = 'new-arrival';

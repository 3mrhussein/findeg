/**
 * Shared types for the catalog schema.
 */

/**
 * Partial translation map for database jsonb columns.
 */
export interface PartialTranslationMap {
  en?: string;
  ar?: string;
}

/**
 * Responsive media asset descriptor.
 */
export interface MediaAsset {
  url: string;
  width?: number;
  height?: number;
  mimeType?: string;
  alt?: PartialTranslationMap;
}

/**
 * Set of responsive media assets by variant role.
 */
export interface ResponsiveMediaSet {
  thumbnail?: MediaAsset;
  card?: MediaAsset;
  pdp?: MediaAsset;
  zoom?: MediaAsset;
  original?: MediaAsset;
}

/**
 * Domain Entity: Brand
 *
 * Represents a product brand (e.g., "Staedtler", "Faber-Castell").
 */

export interface Brand {
  id: number;
  /** URL-friendly identifier (e.g., "staedtler") */
  slug: string;
  /** Display name */
  name: string;
  /** Brand logo image URL */
  logoUrl?: string;
  /** Whether the brand is active */
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

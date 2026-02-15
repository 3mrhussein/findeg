/**
 * Domain Entity: Brand
 *
 * Represents a product brand (e.g., "Staedtler", "Faber-Castell").
 */
export interface Brand {
  id: number;
  slug: string;
  name: string;
  /** Logo URL; null/undefined when no logo */
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

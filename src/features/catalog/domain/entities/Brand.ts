/**
 * Domain Entity: Brand
 *
 * Represents a product brand (e.g., "Staedtler", "Faber-Castell").
 */
import { ID, Slug } from "@/features/core/domain/types/common";

export interface Brand {
  id: ID;
  slug: Slug;
  name: string;
  /** Logo URL; null/undefined when no logo */
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

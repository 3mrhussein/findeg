/**
 * Input for creating/updating a brand
 */
export interface BrandInput {
  slug: string;
  name: string;
  logoUrl?: string;
  isActive?: boolean;
}

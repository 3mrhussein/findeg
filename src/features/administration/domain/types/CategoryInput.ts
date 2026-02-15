/**
 * Input for creating/updating a category
 */
export interface CategoryInput {
  slug: string;
  parentId?: number;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  translations: {
    language: string;
    name: string;
    description?: string;
  }[];
}

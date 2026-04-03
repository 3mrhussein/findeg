/**
 * Category Repository Contract
 * 
 * Defines the interface for category data access operations.
 * Backend package exports this interface; frontend packages import it.
 */

export type Category = {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryTree = Category & {
  children: CategoryTree[];
};

export type CategoryFilters = {
  parentId?: string | null;
  isActive?: boolean;
  search?: string;
};

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findMany(filters?: CategoryFilters): Promise<Category[]>;
  findTree(): Promise<CategoryTree[]>; // Hierarchical category structure
  create(data: CreateCategoryInput): Promise<Category>;
  update(id: string, data: UpdateCategoryInput): Promise<Category>;
  delete(id: string): Promise<void>;
}

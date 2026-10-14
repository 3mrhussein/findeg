export interface CatalogHealthStats {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  fullyComplete: number;
  missingCategory: number;
  missingImages: number;
  missingPrice: number;
  draftProducts: number;
}

export interface CategoryProductDistribution {
  categoryId: string;
  categoryName: string;
  productCount: number;
  percentage: number;
}

import {
  getCatalogHealthRaw,
  getCategoryDistributionRaw,
  getProductCountRaw,
  getCategoryCountRaw,
  getBrandCountRaw,
} from '@findeg/db/queries';
import { QueryError } from './helpers';
import type {
  CatalogHealthStats,
  CategoryProductDistribution,
} from '../catalog-catalog-health-stats';
export class AdminCatalogMetrics {
  async getCounts() {
    const [totalProducts, totalCategories, totalBrands] = await Promise.all([
      getProductCountRaw(),
      getCategoryCountRaw(),
      getBrandCountRaw(),
    ]);
    return { totalProducts, totalCategories, totalBrands };
  }
  /**
   * Retrieves specific catalog health completion metrics.
   */
  async getCatalogHealthStats(): Promise<CatalogHealthStats> {
    try {
      return await getCatalogHealthRaw();
    } catch (error) {
      if (error instanceof Error) {
        throw new QueryError(`Failed to retrieve catalog health stats: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Evaluates catalog coverage distributed across top categories.
   */
  async getCategoryProductDistribution(): Promise<CategoryProductDistribution[]> {
    try {
      const results = await getCategoryDistributionRaw(6);
      const totalProducts = results.reduce((sum, result) => sum + result.productCount, 0);

      return results.map((result) => {
        const nameMap = (result.localizedName || {}) as Record<string, string>;

        return {
          categoryId: String(result.categoryId),
          categoryName: nameMap.en || result.slug || 'Unknown',
          productCount: result.productCount,
          percentage:
            totalProducts > 0 ? Math.round((result.productCount / totalProducts) * 100) : 0,
        };
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new QueryError(`Failed to retrieve category distribution: ${error.message}`);
      }
      throw error;
    }
  }
}

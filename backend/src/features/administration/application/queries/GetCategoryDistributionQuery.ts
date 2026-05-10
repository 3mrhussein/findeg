import { CategoryProductDistribution } from '../../domain/types/CatalogHealthStats';
import { getCategoryDistributionRaw } from '@findeg/db/queries';
import { QueryError } from '../../../core/domain/errors/QueryError';

/**
 * Query to retrieve category product distribution metrics.
 * Implements CQRS and handles mapping from raw database results to application-level DTOs.
 */
export class GetCategoryDistributionQuery {
  async execute(limit: number = 6): Promise<CategoryProductDistribution[]> {
    try {
      const results = await getCategoryDistributionRaw(limit);
      const totalProducts = results.reduce((sum, r) => sum + r.productCount, 0);

      return results.map((r) => {
        // Mapping logic stays in the query class as requested
        const nameMap = (r.localizedName || {}) as Record<string, string>;
        return {
          categoryId: String(r.categoryId),
          categoryName: nameMap.en || r.slug || 'Unknown',
          productCount: r.productCount,
          percentage: totalProducts > 0 ? Math.round((r.productCount / totalProducts) * 100) : 0,
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

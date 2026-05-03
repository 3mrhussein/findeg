import { ICategoryRepository } from '../../../catalog/application/interfaces/ICategoryRepository';
import { IBrandRepository } from '../../../catalog/application/interfaces/IBrandRepository';
import { CatalogHealthStats } from '../../domain/types/CatalogHealthStats';
import { getCatalogHealthRaw } from '@findeg/db/queries';
import { QueryError } from '../../../core/domain/errors/QueryError';

/**
 * Query to retrieve catalog health metrics.
 * Decouples the application service from complex database aggregations.
 */
export class GetCatalogHealthQuery {
  constructor(
    private categoryRepository: ICategoryRepository,
    private brandRepository?: IBrandRepository,
  ) {}

  async execute(): Promise<CatalogHealthStats> {
    try {
      const [rawStats, totalCategories, totalBrands] = await Promise.all([
        getCatalogHealthRaw(),
        this.categoryRepository.count(),
        this.brandRepository ? this.brandRepository.count() : Promise.resolve(0),
      ]);

      return {
        ...rawStats,
        totalCategories,
        totalBrands,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new QueryError(`Failed to retrieve catalog health stats: ${error.message}`);
      }
      throw error;
    }
  }
}

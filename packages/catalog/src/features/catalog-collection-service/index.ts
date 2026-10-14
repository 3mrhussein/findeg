import { ICollectionService } from '../catalog-i-collection-service/types';
import { Collection } from '../catalog-collection/index';
import { collectionQueries } from '@findeg/db/queries';

export class CollectionService implements ICollectionService {
  async getAllCollections(): Promise<Collection[]> {
    return collectionQueries.getAllCollections() as Promise<Collection[]>;
  }

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    return collectionQueries.getCollectionBySlugWithTags(slug) as Promise<Collection | null>;
  }
}

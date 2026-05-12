import { ICollectionService } from '../interfaces/ICollectionService';
import { Collection } from '../../domain/entities/Collection';
import { collectionQueries } from '@findeg/db/queries';

export class CollectionService implements ICollectionService {
  async getAllCollections(): Promise<Collection[]> {
    return collectionQueries.getAllCollections() as Promise<Collection[]>;
  }

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    return collectionQueries.getCollectionBySlugWithTags(slug) as Promise<
      (Collection & { tags: any[] }) | null
    >;
  }
}

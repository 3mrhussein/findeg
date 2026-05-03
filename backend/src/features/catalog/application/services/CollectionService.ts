import { ICollectionRepository } from '../interfaces/ICollectionRepository';
import { ICollectionService } from '../interfaces/ICollectionService';
import { Collection } from '../../domain/entities/Collection';

export class CollectionService implements ICollectionService {
  constructor(private collectionRepository: ICollectionRepository) {}

  async getAllCollections(): Promise<Collection[]> {
    return this.collectionRepository.getAll();
  }

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    return this.collectionRepository.getBySlug(slug);
  }
}

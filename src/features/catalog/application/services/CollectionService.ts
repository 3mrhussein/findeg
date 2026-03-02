/**
 * Collection Service Implementation
 */

import { ICollectionRepository } from "../interfaces/ICollectionRepository";
import { ICollectionService } from "../interfaces/ICollectionService";
import { Collection } from "../../domain/entities/Collection";

/**
 *
 */
export class CollectionService implements ICollectionService {
  /**
   *
   */
  constructor(private collectionRepository: ICollectionRepository) {}

  /**
   * Retrieves all active collections.
   */
  async getAllCollections(): Promise<Collection[]> {
    return this.collectionRepository.getAll();
  }

  /**
   * Retrieves a collection by slug.
   */
  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    return this.collectionRepository.getBySlug(slug);
  }
}

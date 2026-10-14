/**
 * Collection Service Interface
 */

import { Collection } from '../catalog-collection/index';

export interface ICollectionService {
  /** Retrieves all active collections */
  getAllCollections(): Promise<Collection[]>;

  /** Retrieves a collection by its slug, including its tags */
  getCollectionBySlug(slug: string): Promise<Collection | null>;
}

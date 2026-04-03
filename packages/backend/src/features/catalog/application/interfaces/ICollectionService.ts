/**
 * Collection Service Interface
 */

import { Collection } from "../../domain/entities/Collection";

export interface ICollectionService {
  /** Retrieves all active collections */
  getAllCollections(): Promise<Collection[]>;

  /** Retrieves a collection by its slug, including its tags */
  getCollectionBySlug(slug: string): Promise<Collection | null>;
}

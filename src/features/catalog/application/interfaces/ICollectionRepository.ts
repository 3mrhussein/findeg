/**
 * Collection Repository Interface
 *
 * Defines the contract for data access operations related to curated collections.
 */

import { ID, Locale } from "@/features/core/domain/types/common";
import { Collection, CreateCollection } from "../../domain/entities/Collection";
import { Product } from "../../domain/entities/Product";

export interface ICollectionRepository {
  /**
   * Retrieves all active collections.
   * Sorted by sortOrder ASC.
   */
  getAll(): Promise<Collection[]>;

  /**
   * Retrieves a single collection by its URL-friendly slug.
   * Useful for public-facing product pages.
   */
  getBySlug(slug: string): Promise<Collection | null>;

  /**
   * Retrieves a single collection by its internal ID.
   */
  getById(id: ID): Promise<Collection | null>;

  /**
   * Creates a new collection record.
   */
  create(input: CreateCollection): Promise<Collection>;

  /**
   * Updates an existing collection record.
   */
  update(id: ID, input: Partial<CreateCollection>): Promise<Collection>;

  /**
   * Deletes a collection record and its tag associations.
   */
  delete(id: ID): Promise<void>;

  /**
   * Retrieves products belonging to a specific collection.
   *
   * Membership Logic (Rule A):
   * Fetches products that have at least one tag associated with the collection.
   */
  getProductsByCollection(collectionId: ID, language?: Locale): Promise<Product[]>;

  /**
   * Bulk assigns tags to a collection.
   * This replaces any existing tag associations for the given collection.
   */
  setCollectionTags(collectionId: ID, tagIds: ID[]): Promise<void>;
}

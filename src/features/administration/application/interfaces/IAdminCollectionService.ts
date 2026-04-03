import { ID } from "@/features/core/domain/types/common";
import { Collection } from "@/features/catalog/domain/entities/Collection";
import { Tag } from "@/features/catalog/domain/entities/Tag";
import { CollectionInput } from "../../domain/types/CollectionInput";

export interface IAdminCollectionService {
  /** Retrieves all collections, optionally including inactive ones */
  getAll(includeInactive?: boolean): Promise<Collection[]>;

  /** Retrieves a single collection by its ID, including its associated tags */
  getById(id: ID): Promise<(Collection & { tags: Tag[] }) | null>;

  /** Creates a new collection */
  create(input: CollectionInput, adminUserId?: number): Promise<Collection>;

  /** Updates an existing collection */
  update(id: ID, input: Partial<CollectionInput>, adminUserId?: number): Promise<Collection>;

  /** Deletes a collection */
  delete(id: ID, adminUserId?: number): Promise<void>;

  /** Updates the sort order of multiple collections */
  reorder(items: { id: ID; sortOrder: number }[], adminUserId?: number): Promise<void>;
}

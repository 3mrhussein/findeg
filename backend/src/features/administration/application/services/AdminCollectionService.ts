import { ID } from '../../../core/domain/types/common';
import { IAdminCollectionService } from '../interfaces/IAdminCollectionService';
import { Collection } from '../../../catalog/domain/entities/Collection';
import { Tag } from '../../../catalog/domain/entities/Tag';
import { CollectionInput } from '@findeg/backend/features/catalog/application/dtos/CollectionInput';
import { IAuditLogService } from '../interfaces/IAuditLogService';
import {
  getCollectionsAll,
  getCollectionByIdWithTags,
  createCollection,
  updateCollection,
  deleteCollection,
  setCollectionTags,
  updateCollectionSortOrders,
} from '@findeg/db/queries';

/**
 * Admin Collection Service
 *
 * Handles management of curated collections using query primitives.
 * No repository dependency - uses direct database queries.
 */
export class AdminCollectionService implements IAdminCollectionService {
  constructor(private auditLogService: IAuditLogService) { }

  /**
   * Retrieves all collections.
   */
  async getAll(includeInactive: boolean = false): Promise<Collection[]> {
    const results = await getCollectionsAll({ includeInactive });
    return results as Collection[];
  }

  /**
   * Retrieves a single collection by ID, including its tags.
   */
  async getById(id: ID): Promise<(Collection & { tags: Tag[] }) | null> {
    const result = await getCollectionByIdWithTags(id);
    return result as (Collection & { tags: Tag[] }) | null;
  }

  /**
   * Creates a new collection, assigns tags, and logs the action.
   */
  async create(input: CollectionInput, adminUserId?: number): Promise<Collection> {
    const { tagIds, ...collectionData } = input;

    const collection = await createCollection(collectionData as any);

    if (tagIds && tagIds.length > 0) {
      await setCollectionTags(collection.id, tagIds);
    }

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'collection',
      entityId: String(collection.id),
      action: 'create',
      newValues: { ...collection, tagIds },
    });

    return collection as Collection;
  }

  /**
   * Updates an existing collection and its tag associations.
   */
  async update(id: ID, input: Partial<CollectionInput>, adminUserId?: number): Promise<Collection> {
    const oldCollection = await getCollectionByIdWithTags(id);

    const { tagIds, ...collectionData } = input;

    const collection = await updateCollection(id, collectionData as any);

    if (tagIds !== undefined) {
      await setCollectionTags(id, tagIds);
    }

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'collection',
      entityId: String(id),
      action: 'update',
      oldValues: oldCollection as unknown as Record<string, unknown>,
      newValues: { ...collection, tagIds },
    });

    return collection as Collection;
  }

  /**
   * Deletes a collection and logs the action.
   */
  async delete(id: ID, adminUserId?: number): Promise<void> {
    const oldCollection = await getCollectionByIdWithTags(id);
    await deleteCollection(id);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'collection',
      entityId: String(id),
      action: 'delete',
      oldValues: oldCollection as unknown as Record<string, unknown>,
    });
  }

  /**
   * Updates display order of collections.
   */
  async reorder(items: { id: ID; sortOrder: number }[], adminUserId?: number): Promise<void> {
    await updateCollectionSortOrders(items);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'collection',
      entityId: 'bulk',
      action: 'reorder',
      newValues: { items },
    });
  }
}
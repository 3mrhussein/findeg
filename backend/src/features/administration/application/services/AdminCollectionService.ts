import { ID } from '../../../core/domain/types/common';
import { IAdminCollectionService } from '../interfaces/IAdminCollectionService';
import { ICollectionRepository } from '../../../catalog/application/interfaces/ICollectionRepository';
import { Collection } from '../../../catalog/domain/entities/Collection';
import { Tag } from '../../../catalog/domain/entities/Tag';
import { CollectionInput } from '../dtos/CollectionInput';
import { IAuditLogService } from '../interfaces/IAuditLogService';

/**
 * Admin Collection Service
 *
 * Handles management of curated collections, including tag assignment and reordering.
 */
export class AdminCollectionService implements IAdminCollectionService {
  /**
   *
   */
  constructor(
    private collectionRepository: ICollectionRepository,
    private auditLogService: IAuditLogService,
  ) {}

  /**
   * Retrieves all collections.
   */
  async getAll(includeInactive: boolean = false): Promise<Collection[]> {
    return this.collectionRepository.getAll({ includeInactive });
  }

  /**
   * Retrieves a single collection by ID, including its tags.
   */
  async getById(id: ID): Promise<(Collection & { tags: Tag[] }) | null> {
    return this.collectionRepository.getByIdWithTags(id);
  }

  /**
   * Creates a new collection, assigns tags, and logs the action.
   */
  async create(input: CollectionInput, adminUserId?: number): Promise<Collection> {
    const { tagIds, ...collectionData } = input;

    const collection = await this.collectionRepository.create(collectionData);

    if (tagIds && tagIds.length > 0) {
      await this.collectionRepository.setCollectionTags(collection.id, tagIds);
    }

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'collection',
      entityId: String(collection.id),
      action: 'create',
      newValues: { ...collection, tagIds },
    });

    return collection;
  }

  /**
   * Updates an existing collection and its tag associations.
   */
  async update(id: ID, input: Partial<CollectionInput>, adminUserId?: number): Promise<Collection> {
    const oldCollection = await this.collectionRepository.getByIdWithTags(id);

    const { tagIds, ...collectionData } = input;

    const collection = await this.collectionRepository.update(id, collectionData);

    if (tagIds !== undefined) {
      await this.collectionRepository.setCollectionTags(id, tagIds);
    }

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'collection',
      entityId: String(id),
      action: 'update',
      oldValues: oldCollection as unknown as Record<string, unknown>,
      newValues: { ...collection, tagIds },
    });

    return collection;
  }

  /**
   * Deletes a collection and logs the action.
   */
  async delete(id: ID, adminUserId?: number): Promise<void> {
    const oldCollection = await this.collectionRepository.getByIdWithTags(id);
    await this.collectionRepository.delete(id);

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
    await this.collectionRepository.updateSortOrders(items);

    await this.auditLogService.logAction({
      adminUserId,
      entityType: 'collection',
      entityId: 'bulk',
      action: 'reorder',
      newValues: { items },
    });
  }
}

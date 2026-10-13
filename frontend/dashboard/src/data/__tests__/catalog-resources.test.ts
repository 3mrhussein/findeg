import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES } from '@findeg/backend/features/core';

const {
  getSession,
  updateTag,
  revalidatePath,
  categoriesService,
  brandsService,
  collectionsService,
  tagsService,
} = vi.hoisted(() => ({
  getSession: vi.fn(),
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
  categoriesService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    checkSlugAvailable: vi.fn(),
    getAll: vi.fn(),
  },
  brandsService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    checkSlugAvailable: vi.fn(),
    getAll: vi.fn(),
    getBrandProductCount: vi.fn(),
  },
  collectionsService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
    checkSlugAvailable: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
  },
  tagsService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleTagStatus: vi.fn(),
    checkSlugAvailable: vi.fn(),
    getAllTags: vi.fn(),
  },
}));

vi.mock('@lib/session', () => ({ getSession }));
vi.mock('next/cache', () => ({
  updateTag,
  revalidatePath,
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock('@i18n/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({ refresh: vi.fn() }),
  Link: () => null,
}));
vi.mock('@findeg/backend/features/administration', () => ({
  createAdministrationServices: () => ({
    categories: categoriesService,
    brands: brandsService,
    collections: collectionsService,
    tags: tagsService,
  }),
}));
vi.mock('@findeg/backend/features/catalog', () => ({
  createCategoryService: () => categoriesService,
  createTagService: () => tagsService,
}));

import {
  checkCategorySlugAvailableAction,
  createCategoryAction,
  deleteCategoryAction,
} from '../categories/actions';
import { checkBrandSlugAvailableAction, deleteBrandAction } from '../brands/actions';
import {
  checkTagSlugAvailableAction,
  toggleTagStatusAction,
  deleteTagAction,
} from '../tags/actions';
import {
  checkCollectionSlugAvailableAction,
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
} from '../collections/actions';
import { getCollections, getCollectionById } from '../collections/queries';

const staffSession = {
  userId: 42,
  user: { id: 42, email: 'staff@example.com', firstName: 'Staff', lastName: 'Member' },
  portalRole: 'staff',
  permissionCodes: [
    PERMISSION_CODES.ADMIN_CATEGORIES_READ,
    PERMISSION_CODES.ADMIN_CATEGORIES_WRITE,
    PERMISSION_CODES.ADMIN_BRANDS_READ,
    PERMISSION_CODES.ADMIN_BRANDS_WRITE,
    PERMISSION_CODES.ADMIN_TAGS_READ,
    PERMISSION_CODES.ADMIN_TAGS_WRITE,
    PERMISSION_CODES.ADMIN_COLLECTIONS_READ,
    PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE,
  ],
  activeRoleIds: [],
};

describe('Catalog Resources & Slug Checks Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockResolvedValue(staffSession);
  });

  describe('Slug Availability Checks', () => {
    it('checks category slug availability (positive & conflicting)', async () => {
      categoriesService.checkSlugAvailable.mockResolvedValueOnce(true);
      const pos = await checkCategorySlugAvailableAction('new-category');
      expect(pos).toEqual({ success: true, available: true });
      expect(categoriesService.checkSlugAvailable).toHaveBeenCalledWith('new-category', undefined);

      categoriesService.checkSlugAvailable.mockResolvedValueOnce(false);
      const conf = await checkCategorySlugAvailableAction('existing-category', 5);
      expect(conf).toEqual({ success: true, available: false });
      expect(categoriesService.checkSlugAvailable).toHaveBeenCalledWith('existing-category', 5);
    });

    it('checks brand slug availability (positive & conflicting)', async () => {
      brandsService.checkSlugAvailable.mockResolvedValueOnce(true);
      const pos = await checkBrandSlugAvailableAction('new-brand');
      expect(pos).toEqual({ success: true, available: true });
      expect(brandsService.checkSlugAvailable).toHaveBeenCalledWith('new-brand', undefined);

      brandsService.checkSlugAvailable.mockResolvedValueOnce(false);
      const conf = await checkBrandSlugAvailableAction('faber', 14);
      expect(conf).toEqual({ success: true, available: false });
      expect(brandsService.checkSlugAvailable).toHaveBeenCalledWith('faber', 14);
    });

    it('checks tag slug availability (positive & conflicting)', async () => {
      tagsService.checkSlugAvailable.mockResolvedValueOnce(true);
      const pos = await checkTagSlugAvailableAction('summer');
      expect(pos).toEqual({ success: true, available: true });
      expect(tagsService.checkSlugAvailable).toHaveBeenCalledWith('summer', undefined);

      tagsService.checkSlugAvailable.mockResolvedValueOnce(false);
      const conf = await checkTagSlugAvailableAction('winter', 2);
      expect(conf).toEqual({ success: true, available: false });
      expect(tagsService.checkSlugAvailable).toHaveBeenCalledWith('winter', 2);
    });

    it('checks collection slug availability (positive & conflicting)', async () => {
      collectionsService.checkSlugAvailable.mockResolvedValueOnce(true);
      const pos = await checkCollectionSlugAvailableAction('back-to-school');
      expect(pos).toEqual({ success: true, available: true });
      expect(collectionsService.checkSlugAvailable).toHaveBeenCalledWith(
        'back-to-school',
        undefined,
      );

      collectionsService.checkSlugAvailable.mockResolvedValueOnce(false);
      const conf = await checkCollectionSlugAvailableAction('back-to-school', 1);
      expect(conf).toEqual({ success: true, available: false });
      expect(collectionsService.checkSlugAvailable).toHaveBeenCalledWith('back-to-school', 1);
    });
  });

  describe('Immediate Refresh & Mutation Invalidation', () => {
    it('category mutations invalidate cache immediately', async () => {
      categoriesService.create.mockResolvedValueOnce({ id: 10 });
      await createCategoryAction({
        slug: 'pens',
        sortOrder: 1,
        isActive: true,
        translations: [{ language: 'en', name: 'Pens' }],
      });
      expect(updateTag).toHaveBeenCalledWith('categories');
      expect(revalidatePath).toHaveBeenCalledWith('/categories');

      categoriesService.delete.mockResolvedValueOnce(undefined);
      await deleteCategoryAction(10);
      expect(updateTag).toHaveBeenCalledWith('categories');
      expect(revalidatePath).toHaveBeenCalledWith('/categories');
    });

    it('tag mutations invalidate cache immediately', async () => {
      tagsService.toggleTagStatus.mockResolvedValueOnce({ id: 1, isActive: false });
      const toggleRes = await toggleTagStatusAction(1);
      expect(toggleRes.success).toBe(true);
      expect(updateTag).toHaveBeenCalledWith('tags');

      tagsService.delete.mockResolvedValueOnce(undefined);
      const deleteRes = await deleteTagAction(1);
      expect(deleteRes.success).toBe(true);
      expect(updateTag).toHaveBeenCalledWith('tags');
    });
  });

  describe('Collections Queries and Mutations with Real Tags', () => {
    it('lists collections from query layer', async () => {
      const sampleCollections = [
        { id: 1, slug: 'featured', sortOrder: 1, isActive: true },
        { id: 2, slug: 'promo', sortOrder: 2, isActive: true },
      ];
      collectionsService.getAll.mockResolvedValueOnce(sampleCollections);

      const result = await getCollections(true);
      expect(result).toEqual(sampleCollections);
      expect(collectionsService.getAll).toHaveBeenCalledWith(true);
    });

    it('gets collection by id with associated tags', async () => {
      const sample = {
        id: 1,
        slug: 'featured',
        sortOrder: 1,
        tags: [{ id: 10, key: 'premium' }],
      };
      collectionsService.getById.mockResolvedValueOnce(sample);

      const result = await getCollectionById(1);
      expect(result).toEqual(sample);
      expect(collectionsService.getById).toHaveBeenCalledWith(1);
    });

    it('creates and edits collection with real tagIds', async () => {
      collectionsService.create.mockResolvedValueOnce({ id: 1, slug: 'deals' });
      const createRes = await createCollectionAction({
        slug: 'deals',
        sortOrder: 1,
        isActive: true,
        tagIds: [10, 20],
        localizedTitle: { en: 'Deals' },
      });
      expect(createRes.success).toBe(true);
      expect(collectionsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ tagIds: [10, 20] }),
      );
      expect(updateTag).toHaveBeenCalledWith('collections');

      collectionsService.update.mockResolvedValueOnce({ id: 1, slug: 'deals-updated' });
      const updateRes = await updateCollectionAction(1, {
        slug: 'deals-updated',
        sortOrder: 2,
        isActive: true,
        tagIds: [30],
        localizedTitle: { en: 'Updated Deals' },
      });
      expect(updateRes.success).toBe(true);
      expect(collectionsService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ tagIds: [30] }),
      );
      expect(updateTag).toHaveBeenCalledWith('collections');
    });

    it('deletes collection and invalidates collections cache', async () => {
      collectionsService.delete.mockResolvedValueOnce(undefined);
      const res = await deleteCollectionAction(1);
      expect(res.success).toBe(true);
      expect(collectionsService.delete).toHaveBeenCalledWith(1);
      expect(updateTag).toHaveBeenCalledWith('collections');
    });
  });

  describe('Brand Deletion Guard & Product Count', () => {
    it('deleteBrandAction returns error when service refuses deletion', async () => {
      brandsService.delete.mockRejectedValueOnce(
        new Error('Cannot delete brand with 2 associated product(s)'),
      );

      const res = await deleteBrandAction(5);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Cannot delete brand with 2 associated product(s)');
      expect(updateTag).not.toHaveBeenCalledWith('brands');
    });
  });
});

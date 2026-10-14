import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PERMISSION_CODES, type SessionPayload } from '@findeg/identity/types';

const {
  getSession,
  updateTag,
  revalidateTag,
  revalidatePath,
  productsService,
  categoriesService,
  brandsService,
  collectionsService,
  tagsService,
  inventoryService,
  identityRolesService,
  identityUsersService,
  partnerMembershipService,
  schoolSupplyListService,
} = vi.hoisted(() => ({
  getSession: vi.fn(),
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  productsService: {
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    getById: vi.fn(),
  },
  categoriesService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorderCategories: vi.fn(),
  },
  brandsService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleBrandStatus: vi.fn(),
  },
  collectionsService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
    checkSlugAvailable: vi.fn(),
  },
  tagsService: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkUpdateStatus: vi.fn(),
    bulkDelete: vi.fn(),
    toggleTagStatus: vi.fn(),
  },
  inventoryService: {
    updateStock: vi.fn(),
    bulkUpdateStock: vi.fn(),
  },
  identityRolesService: {
    createRole: vi.fn(),
    updateRolePermissions: vi.fn(),
    deleteRole: vi.fn(),
  },
  identityUsersService: {
    createAdmin: vi.fn(),
    updateAdmin: vi.fn(),
    setPermissionOverrides: vi.fn(),
  },
  partnerMembershipService: {
    createPartner: vi.fn(),
    updatePartner: vi.fn(),
    changePartnerStatus: vi.fn(),
  },
  schoolSupplyListService: {
    setOffer: vi.fn(),
    clearOffer: vi.fn(),
    cloneToDraft: vi.fn(),
    archive: vi.fn(),
    publish: vi.fn(),
  },
}));

vi.mock('@lib/session', () => ({ getSession }));
vi.mock('next/cache', () => ({ updateTag, revalidateTag, revalidatePath }));
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
    products: productsService,
    categories: categoriesService,
    brands: brandsService,
    collections: collectionsService,
    tags: tagsService,
    inventory: inventoryService,
    schoolSupplyLists: schoolSupplyListService,
  }),
}));
vi.mock('@findeg/identity', () => ({
  createIdentityServices: () => ({
    adminRoles: identityRolesService,
    adminUsers: identityUsersService,
  }),
}));
vi.mock('@findeg/partners', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@findeg/partners')>();
  return {
    ...actual,
    createPartnerMembershipServices: () => ({
      partners: partnerMembershipService,
      members: {
        getMembers: vi.fn(),
        updateRole: vi.fn(),
        suspendMember: vi.fn(),
        reactivateMember: vi.fn(),
        endMembership: vi.fn(),
      },
      invitations: {
        createInvitation: vi.fn(),
        resendInvitation: vi.fn(),
        revokeInvitation: vi.fn(),
        getInvitations: vi.fn(),
      },
    }),
  };
});

import { createProduct, deleteProduct } from '@data/products/actions';
import { createCategoryAction, deleteCategoryAction } from '@data/categories/actions';
import { createBrandAction, deleteBrandAction } from '@data/brands/actions';
import {
  createCollectionAction,
  deleteCollectionAction,
  checkCollectionSlugAvailableAction,
} from '@data/collections/actions';
import { createTagAction, deleteTagAction } from '@data/tags/actions';
import { updateStock } from '@data/inventory/actions';
import { createRoleAction, deleteRoleAction, createAdminAction } from '@data/access/actions';
import { savePartnerAction } from '@/app/[locale]/(dashboard)/partners/_actions/partners';
import { changePartnerStatusAction } from '@/app/[locale]/(dashboard)/partners/_actions/status';
import {
  clearOfferAction,
  saveOfferAction,
} from '@/app/[locale]/(dashboard)/school-lists/_actions/offer';
import {
  publishListAction,
  cloneListAction,
  archiveListAction,
} from '@/app/[locale]/(dashboard)/school-lists/_actions/lists';

function staffSession(permissionCodes: string[], activeRoleIds: string[] = []): SessionPayload {
  return {
    userId: 42,
    user: { id: 42, email: 'staff@example.com', firstName: 'Staff', lastName: 'Member' },
    portalRole: 'staff',
    permissionCodes,
    activeRoleIds,
  } as unknown as SessionPayload;
}

function customerSession(): SessionPayload {
  return {
    userId: 99,
    user: { id: 99, email: 'customer@example.com' },
    portalRole: 'customer',
    permissionCodes: [
      PERMISSION_CODES.ADMIN_PRODUCTS_WRITE,
      PERMISSION_CODES.ADMIN_CATEGORIES_WRITE,
    ],
    activeRoleIds: [],
  } as unknown as SessionPayload;
}

describe('Server Action Security Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Product actions', () => {
    it('refuses unauthenticated calls and makes no backend changes', async () => {
      getSession.mockResolvedValue(null);

      const res = await createProduct({} as unknown as Parameters<typeof createProduct>[0]);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(productsService.createProduct).not.toHaveBeenCalled();
      expect(updateTag).not.toHaveBeenCalled();
    });

    it('refuses customer sessions even with permission codes', async () => {
      getSession.mockResolvedValue(customerSession());

      const res = await deleteProduct(123);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(productsService.deleteProduct).not.toHaveBeenCalled();
    });

    it('refuses staff lacking admin.products.write permission', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_PRODUCTS_READ]));

      const res = await deleteProduct(123);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(productsService.deleteProduct).not.toHaveBeenCalled();
    });

    it('allows staff with admin.products.write permission', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_PRODUCTS_WRITE]));
      productsService.deleteProduct.mockResolvedValue(undefined);

      const res = await deleteProduct(123);
      expect(res.success).toBe(true);
      expect(productsService.deleteProduct).toHaveBeenCalledWith(123);
    });
  });

  describe('Category actions', () => {
    it('refuses unauthenticated calls and makes no backend changes', async () => {
      getSession.mockResolvedValue(null);

      const res = await createCategoryAction({
        slug: 'pens',
        sortOrder: 1,
        isActive: true,
        translations: [{ language: 'en', name: 'Pens' }],
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(categoriesService.create).not.toHaveBeenCalled();
    });

    it('refuses staff lacking admin.categories.write', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_CATEGORIES_READ]));

      const res = await deleteCategoryAction(45);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(categoriesService.delete).not.toHaveBeenCalled();
    });

    it('allows staff with admin.categories.write', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_CATEGORIES_WRITE]));
      categoriesService.delete.mockResolvedValue(undefined);

      const res = await deleteCategoryAction(45);
      expect(res.success).toBe(true);
      expect(categoriesService.delete).toHaveBeenCalledWith(45);
    });
  });

  describe('Brand actions', () => {
    it('refuses unauthenticated calls and makes no backend changes', async () => {
      getSession.mockResolvedValue(null);

      const res = await createBrandAction({
        nameEn: 'Brand',
        nameAr: 'علامة',
        slug: 'brand',
        isActive: true,
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(brandsService.create).not.toHaveBeenCalled();
    });

    it('refuses staff lacking admin.brands.write', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_BRANDS_READ]));

      const res = await deleteBrandAction(10);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(brandsService.delete).not.toHaveBeenCalled();
    });

    it('allows staff with admin.brands.write', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_BRANDS_WRITE]));
      brandsService.delete.mockResolvedValue(undefined);

      const res = await deleteBrandAction(10);
      expect(res.success).toBe(true);
      expect(brandsService.delete).toHaveBeenCalledWith(10);
    });
  });

  describe('Collection actions', () => {
    it('refuses unauthenticated calls and makes no backend changes', async () => {
      getSession.mockResolvedValue(null);

      const res = await createCollectionAction({
        slug: 'col',
        sortOrder: 1,
        isActive: true,
        tagIds: [],
        localizedTitle: { en: 'Col' },
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(collectionsService.create).not.toHaveBeenCalled();
    });

    it('refuses staff lacking admin.collections.write', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_COLLECTIONS_READ]));

      const res = await deleteCollectionAction(8);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(collectionsService.delete).not.toHaveBeenCalled();
    });

    it('allows staff with admin.collections.write', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_COLLECTIONS_WRITE]));
      collectionsService.delete.mockResolvedValue(undefined);

      const res = await deleteCollectionAction(8);
      expect(res.success).toBe(true);
      expect(collectionsService.delete).toHaveBeenCalledWith(8);
    });

    it('refuses checking collection slug when unauthenticated', async () => {
      getSession.mockResolvedValue(null);

      const res = await checkCollectionSlugAvailableAction('new-col');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(collectionsService.checkSlugAvailable).not.toHaveBeenCalled();
    });

    it('allows staff with admin.collections.read to check slug availability', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_COLLECTIONS_READ]));
      collectionsService.checkSlugAvailable.mockResolvedValue(true);

      const res = await checkCollectionSlugAvailableAction('new-col');
      expect(res.success).toBe(true);
      expect(res.available).toBe(true);
      expect(collectionsService.checkSlugAvailable).toHaveBeenCalledWith('new-col', undefined);
    });
  });

  describe('Tag actions', () => {
    it('refuses unauthenticated calls and makes no backend changes', async () => {
      getSession.mockResolvedValue(null);

      const res = await createTagAction({
        group: 'general',
        key: 'tag',
        slug: 'tag',
        icon: 'tag',
        color: '#000',
        isActive: true,
        scope: 'catalog',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(tagsService.create).not.toHaveBeenCalled();
    });

    it('refuses staff lacking admin.tags.write', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_TAGS_READ]));

      const res = await deleteTagAction(3);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(tagsService.delete).not.toHaveBeenCalled();
    });

    it('allows staff with admin.tags.write', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_TAGS_WRITE]));
      tagsService.delete.mockResolvedValue(undefined);

      const res = await deleteTagAction(3);
      expect(res.success).toBe(true);
      expect(tagsService.delete).toHaveBeenCalledWith(3);
    });
  });

  describe('Inventory actions', () => {
    it('refuses unauthenticated calls and makes no backend changes', async () => {
      getSession.mockResolvedValue(null);

      const res = await updateStock({ variantId: 1, quantity: 10 });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(inventoryService.updateStock).not.toHaveBeenCalled();
    });

    it('refuses staff lacking admin.inventory.write', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_INVENTORY_READ]));

      const res = await updateStock({ variantId: 1, quantity: 10 });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(inventoryService.updateStock).not.toHaveBeenCalled();
    });

    it('allows staff with admin.inventory.write', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_INVENTORY_WRITE]));
      inventoryService.updateStock.mockResolvedValue(undefined);

      const res = await updateStock({ variantId: 1, quantity: 10 });
      expect(res.success).toBe(true);
      expect(inventoryService.updateStock).toHaveBeenCalledWith({ variantId: 1, quantity: 10 });
    });
  });

  describe('Access & Role actions', () => {
    it('refuses unauthenticated calls to role actions', async () => {
      getSession.mockResolvedValue(null);

      const res = await createRoleAction('custom', 'Custom Role', [1, 2]);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(identityRolesService.createRole).not.toHaveBeenCalled();
    });

    it('refuses staff lacking admin.roles.write permission for role actions', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_ROLES_READ]));

      const res = await deleteRoleAction(5);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(identityRolesService.deleteRole).not.toHaveBeenCalled();
    });

    it('refuses staff lacking admin.users.write permission for admin user actions', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_USERS_READ]));

      const res = await createAdminAction({
        email: 'new@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'Admin',
        roleIds: [1],
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Not authorized/i);
      expect(identityUsersService.createAdmin).not.toHaveBeenCalled();
    });

    it('allows staff with admin.roles.write to manage roles', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_ROLES_WRITE]));
      identityRolesService.deleteRole.mockResolvedValue(undefined);

      const res = await deleteRoleAction(5);
      expect(res.success).toBe(true);
      expect(identityRolesService.deleteRole).toHaveBeenCalledWith(5);
    });

    it('allows staff with admin.users.write to manage admin users', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_USERS_WRITE]));
      identityUsersService.createAdmin.mockResolvedValue({ id: 10 });

      const res = await createAdminAction({
        email: 'new@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'Admin',
        roleIds: [1],
      });
      expect(res.success).toBe(true);
      expect(identityUsersService.createAdmin).toHaveBeenCalled();
    });
  });

  describe('Partner actions', () => {
    it('refuses unauthenticated calls', async () => {
      getSession.mockResolvedValue(null);
      const fd = new FormData();
      fd.set('code', 'school-1');
      fd.set('nameEn', 'School');
      fd.set('nameAr', 'مدرسة');

      const res = await savePartnerAction('en', null, { status: 'idle' }, fd);
      expect(res.status).toBe('error');
      expect(partnerMembershipService.createPartner).not.toHaveBeenCalled();
    });

    it('refuses staff lacking partners.manage permission', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.PARTNER_REPORTS_VIEW]));

      const res = await changePartnerStatusAction('en', 1, 'active');
      expect(res.status).toBe('error');
      expect(partnerMembershipService.changePartnerStatus).not.toHaveBeenCalled();
    });

    it('allows staff with partners.manage permission', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.PARTNERS_MANAGE]));
      partnerMembershipService.changePartnerStatus.mockResolvedValue({ success: true });

      const res = await changePartnerStatusAction('en', 1, 'active');
      expect(res.status).toBe('idle');
      expect(partnerMembershipService.changePartnerStatus).toHaveBeenCalled();
    });

    it('returns invalid-input if school profile details lack area', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.PARTNERS_MANAGE]));
      const fd = new FormData();
      fd.set('code', 'school-1');
      fd.set('nameEn', 'School');
      fd.set('nameAr', 'مدرسة');
      fd.set('logoUrl', 'https://example.com/logo.png');

      const res = await savePartnerAction('en', null, { status: 'idle' }, fd);
      expect(res).toEqual({ status: 'error', message: 'invalid-input' });
      expect(partnerMembershipService.createPartner).not.toHaveBeenCalled();
    });
  });

  describe('unexpected partner/offer failures', () => {
    const scenarios = [
      {
        name: 'partner save',
        permission: PERMISSION_CODES.PARTNERS_MANAGE,
        service: partnerMembershipService.createPartner,
        run: () => savePartnerAction('en', null, { status: 'idle' }, new FormData()),
      },
      {
        name: 'offer save',
        permission: PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
        service: schoolSupplyListService.setOffer,
        run: () => {
          const data = new FormData();
          data.set('percent', '10');
          data.set('startsAt', '2026-10-15T10:00');
          return saveOfferAction('en', 1, { status: 'idle' }, data);
        },
      },
      {
        name: 'offer clear',
        permission: PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE,
        service: schoolSupplyListService.clearOffer,
        run: () => clearOfferAction('en', 1, { status: 'idle' }),
      },
    ];
    it.each(scenarios)(
      '$name propagates unexpected service failures',
      async ({ permission, service, run }) => {
        getSession.mockResolvedValue(staffSession([permission]));
        const failure = new Error('database unavailable');
        service.mockRejectedValueOnce(failure);
        await expect(run()).rejects.toBe(failure);
        expect(updateTag).not.toHaveBeenCalled();
      },
    );
    it.each(scenarios)(
      '$name propagates refresh failure after the write succeeds',
      async ({ permission, service, run }) => {
        getSession.mockResolvedValue(staffSession([permission]));
        service.mockResolvedValueOnce({ success: true, data: { id: 1 } });
        const failure = new Error('cache refresh failed');
        revalidatePath.mockImplementationOnce(() => {
          throw failure;
        });
        await expect(run()).rejects.toBe(failure);
        expect(service).toHaveBeenCalledTimes(1);
      },
    );
  });

  describe('School Supply List actions', () => {
    it('refuses unauthenticated calls to clear offer', async () => {
      getSession.mockResolvedValue(null);

      const res = await clearOfferAction('en', 1, { status: 'idle' });
      expect(res.status).toBe('error');
      expect(schoolSupplyListService.clearOffer).not.toHaveBeenCalled();
    });

    it('refuses staff lacking admin.schoollists.write permission', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ]));

      const res = await clearOfferAction('en', 1, { status: 'idle' });
      expect(res.status).toBe('error');
      expect(schoolSupplyListService.clearOffer).not.toHaveBeenCalled();
    });

    it('allows staff with admin.schoollists.write permission', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE]));
      schoolSupplyListService.clearOffer.mockResolvedValue({ success: true });

      const res = await clearOfferAction('en', 1, { status: 'idle' });
      expect(res.status).toBe('cleared');
      expect(schoolSupplyListService.clearOffer).toHaveBeenCalled();
    });

    it('refuses unauthenticated calls to save offer', async () => {
      getSession.mockResolvedValue(null);
      const fd = new FormData();
      fd.set('percent', '10');
      fd.set('startsAt', '2026-10-15T10:00');

      const res = await saveOfferAction('en', 1, { status: 'idle' }, fd);
      expect(res.status).toBe('error');
      expect(schoolSupplyListService.setOffer).not.toHaveBeenCalled();
    });

    it('refuses unauthenticated calls to publish list', async () => {
      getSession.mockResolvedValue(null);

      const res = await publishListAction(1);
      expect(res.status).toBe('error');
      expect(schoolSupplyListService.publish).not.toHaveBeenCalled();
    });

    it('refuses staff lacking write permission to publish list', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ]));

      const res = await publishListAction(1);
      expect(res.status).toBe('error');
      expect(schoolSupplyListService.publish).not.toHaveBeenCalled();
    });

    it('allows staff with write permission to publish list', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE]));
      schoolSupplyListService.publish.mockResolvedValue({
        success: true,
        data: { list: { id: 1 }, warnings: [] },
      });

      const res = await publishListAction(1);
      expect(res.status).toBe('success');
      expect(schoolSupplyListService.publish).toHaveBeenCalled();
    });

    it('refuses unauthenticated calls to clone list', async () => {
      getSession.mockResolvedValue(null);

      const res = await cloneListAction(1);
      expect(res.status).toBe('error');
      expect(schoolSupplyListService.cloneToDraft).not.toHaveBeenCalled();
    });

    it('refuses staff lacking write permission to clone list', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ]));

      const res = await cloneListAction(1);
      expect(res.status).toBe('error');
      expect(schoolSupplyListService.cloneToDraft).not.toHaveBeenCalled();
    });

    it('allows staff with write permission to clone list', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE]));
      schoolSupplyListService.cloneToDraft.mockResolvedValue({
        success: true,
        data: { id: 2 },
      });

      const res = await cloneListAction(1);
      expect(res.status).toBe('success');
      expect(schoolSupplyListService.cloneToDraft).toHaveBeenCalled();
    });

    it('refuses unauthenticated calls to archive list', async () => {
      getSession.mockResolvedValue(null);

      const res = await archiveListAction(1);
      expect(res.status).toBe('error');
      expect(schoolSupplyListService.archive).not.toHaveBeenCalled();
    });

    it('refuses staff lacking write permission to archive list', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_SCHOOL_LISTS_READ]));

      const res = await archiveListAction(1);
      expect(res.status).toBe('error');
      expect(schoolSupplyListService.archive).not.toHaveBeenCalled();
    });

    it('allows staff with write permission to archive list', async () => {
      getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_SCHOOL_LISTS_WRITE]));
      schoolSupplyListService.archive.mockResolvedValue({ success: true, data: { id: 1 } });

      const res = await archiveListAction(1);
      expect(res.status).toBe('success');
      expect(schoolSupplyListService.archive).toHaveBeenCalled();
    });
  });
});

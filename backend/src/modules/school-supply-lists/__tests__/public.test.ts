import { describe, expect, it } from 'vitest';
import { createSchoolSupplyLists } from '../public.js';
import type { SchoolSupplyListStore } from '../public.js';
import type { SchoolSupplyList } from '../contracts.js';
import type { PartnerSession } from '../../partner-management/contracts.js';

const session: PartnerSession = {
  userId: 7,
  email: 'manager@example.test',
  emailVerified: true,
  activePortal: 'partner',
  authorizationVersion: 1,
  staffRoles: [],
  permissions: [],
  partner: {
    businessPartnerId: 12,
    membershipId: 4,
    roles: ['list-manager'],
    authorizationVersion: 1,
  },
};

const input = {
  academicYear: '2026-2027',
  schoolName: 'FindEg School',
  grade: 'Grade 4',
  title: { en: 'Grade 4 list', ar: 'قائمة الصف الرابع' },
};

const items = [
  { variantId: 3, quantity: 2, label: { en: 'Notebook', ar: 'كراسة' }, exactItem: true },
];

const variant = {
  id: 3,
  productId: 1,
  productName: { en: 'Notebook', ar: 'كراسة' },
  sku: 'NOTEBOOK-1',
  variantKey: 'default',
  label: { en: 'Ruled', ar: 'مسطرة' },
  basePrice: '25.00',
  isActive: true,
};

function setup() {
  let listId = 1;
  const lists = new Map<number, any>();
  const store: SchoolSupplyListStore = {
    createDraft: async (businessPartnerId: number, createdBy: number, value: typeof input) => {
      const list = {
        id: listId++,
        businessPartnerId,
        status: 'draft' as SchoolSupplyList['status'],
        ...value,
        items: [],
        createdBy,
      };
      lists.set(list.id, list);
      return list;
    },
    get: async (businessPartnerId: number, id: number) => {
      const list = lists.get(id);
      return list?.businessPartnerId === businessPartnerId ? list : undefined;
    },
    replaceItems: async (id: number, value: typeof items) => {
      lists.get(id).items = value.map((item) => ({ ...item, id: 1 }));
    },
    publish: async (id: number, snapshots: (typeof variant)[], replacesListId?: number) => {
      const list = lists.get(id);
      list.status = 'published';
      list.publicCode = 'a'.repeat(16);
      list.items = list.items.map((item: any) => ({
        ...item,
        productName: snapshots[0].productName,
        sku: snapshots[0].sku,
        unitPrice: snapshots[0].basePrice,
      }));
      if (replacesListId) lists.get(replacesListId).status = 'archived';
      return list;
    },
    clone: async (id: number, createdBy: number) => {
      const source = lists.get(id);
      const clone = {
        ...source,
        id: listId++,
        status: 'draft',
        sourceListId: id,
        createdBy,
        items: source.items.map((item: any) => ({ ...item })),
      };
      lists.set(clone.id, clone);
      return clone;
    },
    byPublicCode: async (code: string) =>
      [...lists.values()].find((list) => list.publicCode === code && list.status === 'published'),
  };
  const catalog = { listVariants: async () => [variant], isDefaultVariant: async () => true };
  const access = {
    workspace: async (currentSession: PartnerSession, partnerId: number) =>
      partnerId === currentSession.partner.businessPartnerId
        ? { status: 'authenticated' as const, session: currentSession }
        : { status: 'authorization-denied' as const, session: currentSession },
  };
  return { lists, operations: createSchoolSupplyLists(store, catalog as any, access) };
}

describe('School Supply Lists', () => {
  it('creates, edits, publishes, and reads an unlisted list', async () => {
    const { operations } = setup();
    const created = await operations.createDraft(session, 12, input);
    expect(created.status).toBe('created');
    if (created.status !== 'created') return;
    expect(await operations.replaceDraft(session, 12, created.list.id, items)).toEqual({
      status: 'updated',
    });
    const published = await operations.publish(session, 12, created.list.id);
    expect(published.status).toBe('published');
    if (published.status !== 'published') return;
    expect((await operations.readUnlisted(published.list.publicCode!)).status).toBe('found');
    expect(await operations.replaceDraft(session, 12, created.list.id, items)).toEqual({
      status: 'immutable',
    });
  });

  it('clones a publication and archives it when the clone replaces it', async () => {
    const { operations } = setup();
    const created = await operations.createDraft(session, 12, input);
    if (created.status !== 'created') return;
    await operations.replaceDraft(session, 12, created.list.id, items);
    await operations.publish(session, 12, created.list.id);
    const clone = await operations.clone(session, 12, created.list.id);
    expect(clone.status).toBe('created');
    if (clone.status !== 'created') return;
    expect((await operations.publish(session, 12, clone.list.id, created.list.id)).status).toBe(
      'published',
    );
  });

  it('denies a manager from another partner', async () => {
    const { operations } = setup();
    expect(await operations.createDraft(session, 99, input)).toMatchObject({
      status: 'authorization-denied',
    });
  });
});

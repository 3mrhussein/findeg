import type { PartnerSession } from '../partner-management/contracts.js';
import type { WorkspaceResolution } from '../partner-management/contracts.js';
import type { CatalogStore } from '../catalog/public.js';
import type {
  SchoolSupplyList,
  SchoolSupplyListInput,
  SchoolSupplyListItemInput,
  Snapshot,
} from './contracts.js';

export interface SchoolSupplyListStore {
  createDraft(
    partnerId: number,
    actorId: number,
    input: SchoolSupplyListInput,
  ): Promise<SchoolSupplyList>;
  get(partnerId: number, listId: number): Promise<SchoolSupplyList | undefined>;
  replaceItems(listId: number, items: readonly SchoolSupplyListItemInput[]): Promise<void>;
  publish(
    listId: number,
    snapshots: readonly Snapshot[],
    replacesListId?: number,
  ): Promise<SchoolSupplyList | undefined>;
  clone(listId: number, actorId: number): Promise<SchoolSupplyList | undefined>;
  byPublicCode(code: string): Promise<SchoolSupplyList | undefined>;
}
export interface PartnerAccess {
  workspace(session: PartnerSession, partnerId: number): Promise<WorkspaceResolution>;
}

type Denied = { readonly status: 'authorization-denied'; readonly session: PartnerSession };
const denied = (session: PartnerSession): Denied => ({ status: 'authorization-denied', session });

async function authorized(session: PartnerSession, partnerId: number, access: PartnerAccess) {
  const resolution = await access.workspace(session, partnerId);
  return (
    resolution.status === 'authenticated' &&
    resolution.session.partner.roles.some(
      (role) => role === 'list-manager' || role === 'partner-administrator',
    )
  );
}

function validInput(input: SchoolSupplyListInput) {
  return (
    !!input &&
    (input.classSection === undefined ||
      (typeof input.classSection === 'string' && input.classSection.trim().length > 0)) &&
    [input.academicYear, input.schoolName, input.grade, input.title?.en, input.title?.ar].every(
      (value) => typeof value === 'string' && value.trim().length > 0,
    )
  );
}

function validItems(items: readonly SchoolSupplyListItemInput[]) {
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.length <= 100 &&
    items.every(
      (item) =>
        !!item &&
        typeof item === 'object' &&
        (item.required === undefined || typeof item.required === 'boolean') &&
        (item.specification === undefined || validSpecification(item.specification)) &&
        Number.isSafeInteger(item.variantId) &&
        item.variantId > 0 &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 999 &&
        typeof item.exactItem === 'boolean' &&
        typeof item.label?.en === 'string' &&
        item.label.en.trim().length > 0 &&
        typeof item.label?.ar === 'string' &&
        item.label.ar.trim().length > 0,
    )
  );
}

export function createSchoolSupplyLists(
  store: SchoolSupplyListStore,
  catalog: CatalogStore,
  access: PartnerAccess,
  matchingCatalog?: import('../catalog/public.js').CatalogListStore,
) {
  async function snapshots(items: readonly SchoolSupplyListItemInput[]) {
    const variants = await catalog.listVariants();
    return Promise.all(
      items.map(async (item) => ({
        variant: variants.find((variant) => variant.id === item.variantId),
        isDefault: await catalog.isDefaultVariant(item.variantId),
      })),
    );
  }

  async function matching(items: readonly SchoolSupplyListItemInput[]) {
    if (!items.some((item) => item.specification)) return true;
    if (!matchingCatalog) return false;
    const variants = await matchingCatalog.readEligible();
    return items.every(
      (item) =>
        !item.specification ||
        allowedAlternatives({ ...item, exactItem: false }, variants).some(
          (variant) => variant.id === item.variantId,
        ),
    );
  }
  return {
    async createDraft(session: PartnerSession, partnerId: number, input: SchoolSupplyListInput) {
      if (!(await authorized(session, partnerId, access))) return denied(session);
      if (!validInput(input)) return { status: 'invalid-input' } as const;
      return {
        status: 'created',
        list: await store.createDraft(partnerId, session.userId, input),
      } as const;
    },
    async replaceDraft(
      session: PartnerSession,
      partnerId: number,
      listId: number,
      items: readonly SchoolSupplyListItemInput[],
    ) {
      if (!(await authorized(session, partnerId, access))) return denied(session);
      if (!validItems(items)) return { status: 'invalid-input' } as const;
      const list = await store.get(partnerId, listId);
      if (!list) return { status: 'not-found' } as const;
      if (list.status !== 'draft') return { status: 'immutable' } as const;
      if (
        !(await matching(items)) ||
        (await snapshots(items)).some(({ variant, isDefault }) => !variant?.isActive || !isDefault)
      )
        return { status: 'variant-unavailable' } as const;
      await store.replaceItems(listId, items);
      return { status: 'updated' } as const;
    },
    async publish(
      session: PartnerSession,
      partnerId: number,
      listId: number,
      replacesListId?: number,
    ) {
      if (!(await authorized(session, partnerId, access))) return denied(session);
      const list = await store.get(partnerId, listId);
      if (!list) return { status: 'not-found' } as const;
      if (
        list.status !== 'draft' ||
        list.items.length === 0 ||
        !list.items.some((item) => item.required !== false) ||
        new Set(list.items.map((item) => item.variantId)).size !== list.items.length
      )
        return { status: 'invalid-transition' } as const;
      if (!(await matching(list.items))) return { status: 'variant-unavailable' } as const;
      const snapshotsWithDefaults = await snapshots(
        list.items.map((item) => ({
          variantId: item.variantId!,
          quantity: item.quantity,
          label: item.label,
          exactItem: item.exactItem,
        })),
      );
      if (snapshotsWithDefaults.some(({ variant, isDefault }) => !variant?.isActive || !isDefault))
        return { status: 'variant-unavailable' } as const;
      const variants = snapshotsWithDefaults.map(({ variant }) => variant!);
      if (replacesListId !== undefined) {
        const previous = await store.get(partnerId, replacesListId);
        if (
          !previous ||
          previous.status !== 'published' ||
          previous.academicYear !== list.academicYear ||
          previous.schoolName !== list.schoolName ||
          previous.grade !== list.grade ||
          previous.classSection !== list.classSection
        )
          return { status: 'replacement-unavailable' } as const;
      }
      const published = await store.publish(listId, variants as Snapshot[], replacesListId);
      return published
        ? ({ status: 'published', list: published } as const)
        : ({ status: 'not-found' } as const);
    },
    async clone(session: PartnerSession, partnerId: number, listId: number) {
      if (!(await authorized(session, partnerId, access))) return denied(session);
      const list = await store.get(partnerId, listId);
      if (!list) return { status: 'not-found' } as const;
      if (list.status !== 'published') return { status: 'invalid-transition' } as const;
      const draft = await store.clone(listId, session.userId);
      return draft
        ? ({ status: 'created', list: draft } as const)
        : ({ status: 'not-found' } as const);
    },
    async readUnlisted(code: string) {
      if (typeof code !== 'string' || code.trim().length < 16)
        return { status: 'not-found' } as const;
      const list = await store.byPublicCode(code.trim());
      return list ? ({ status: 'found', list } as const) : ({ status: 'not-found' } as const);
    },
  };
}

/** Missing frozen specifications fail closed: only the original default remains eligible. */
export function allowedAlternatives(
  item: Pick<
    import('./contracts.js').SchoolSupplyListItem,
    'variantId' | 'exactItem' | 'specification'
  >,
  variants: readonly import('../catalog/contracts.js').ListCatalogVariant[],
) {
  return variants.filter((variant) => {
    if (item.exactItem || !item.specification) return variant.id === item.variantId;
    return (
      variant.categoryId === item.specification.categoryId &&
      Object.entries(item.specification.attributes).every(
        ([key, value]) => variant.attributes[key] === value,
      )
    );
  });
}

function validSpecification(input: unknown): boolean {
  if (!input || typeof input !== 'object') return false;
  const value = input as Record<string, unknown>;
  return (
    Object.keys(value).every((key) => ['categoryId', 'attributes'].includes(key)) &&
    Number.isSafeInteger(value.categoryId) &&
    Number(value.categoryId) > 0 &&
    !!value.attributes &&
    typeof value.attributes === 'object' &&
    !Array.isArray(value.attributes) &&
    Object.entries(value.attributes).every(
      ([key, attribute]) =>
        key.trim().length > 0 && typeof attribute === 'string' && attribute.trim().length > 0,
    )
  );
}

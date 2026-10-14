'use cache';

import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import type { SessionPayload } from '@findeg/identity';
import { createAdministrationServices } from '@/lib/administration';
import type { SchoolSupplyListIndexFilters } from '@findeg/school-lists/types';

function toListActor(session: SessionPayload) {
  return {
    kind: 'staff' as const,
    userId: session.userId,
    permissionCodes: session.permissionCodes,
    activeRoleIds: session.activeRoleIds,
  };
}

export async function getSchoolSupplyLists(
  session: SessionPayload,
  filters?: SchoolSupplyListIndexFilters,
) {
  cacheTag('school-lists');
  cacheLife('minutes');

  const { schoolSupplyLists } = createAdministrationServices();
  return await schoolSupplyLists.listAll(toListActor(session), filters);
}

export async function getSchoolSupplyListById(session: SessionPayload, listId: number) {
  cacheTag('school-lists');
  cacheLife('minutes');

  const { schoolSupplyLists } = createAdministrationServices();
  return await schoolSupplyLists.getById(toListActor(session), listId);
}

export async function getSchoolSupplyListOffer(session: SessionPayload, listId: number) {
  cacheTag('school-lists');
  cacheLife('minutes');

  const { schoolSupplyLists } = createAdministrationServices();
  return await schoolSupplyLists.getOffer(toListActor(session), listId);
}

export async function listSchoolSupplyListsForPartner(session: SessionPayload, partnerId: number) {
  cacheTag('school-lists');
  cacheLife('minutes');

  const { schoolSupplyLists } = createAdministrationServices();
  return await schoolSupplyLists.listForPartner(toListActor(session), partnerId);
}

export async function getSpecificationOptions(session: SessionPayload, categoryId: number) {
  cacheTag('school-lists');
  cacheLife('minutes');

  const { schoolSupplyLists } = createAdministrationServices();
  return await schoolSupplyLists.listSpecificationOptions(toListActor(session), categoryId);
}

export async function getVariantCandidates(session: SessionPayload, categoryId: number) {
  cacheTag('school-lists');
  cacheLife('minutes');

  const { schoolSupplyLists } = createAdministrationServices();
  return await schoolSupplyLists.listVariantCandidates(toListActor(session), categoryId);
}

/** List-only Staff can read the names/statuses needed by their own screens. */
export async function getSchoolListPartnerOptions(session: SessionPayload) {
  cacheTag('school-lists', 'partners');
  cacheLife('minutes');
  const { schoolSupplyLists } = createAdministrationServices();
  return schoolSupplyLists.listPartnerOptions(toListActor(session));
}

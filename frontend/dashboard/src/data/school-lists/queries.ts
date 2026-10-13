'use cache';

import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import type { SessionPayload } from '@findeg/backend/features/core';
import { createAdministrationServices } from '@findeg/backend/features/administration';

function toListActor(session: SessionPayload) {
  return {
    kind: 'staff' as const,
    userId: session.userId,
    permissionCodes: session.permissionCodes,
    activeRoleIds: session.activeRoleIds,
  };
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

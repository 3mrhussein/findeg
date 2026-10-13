'use cache';

import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import type { SessionPayload } from '@findeg/backend/features/core';
import type { Locale } from '@findeg/domain';
import { createPartnerMembershipServices } from '@findeg/backend/features/partner-membership';
import {
  createPartnerSalesServices,
  MIN_DISTINCT_ORDERS_PER_SALES_ROW,
} from '@findeg/backend/features/partner-sales';

export { MIN_DISTINCT_ORDERS_PER_SALES_ROW };

function toStaffActor(session: SessionPayload) {
  return {
    kind: 'staff' as const,
    userId: session.userId,
    permissionCodes: session.permissionCodes,
    activeRoleIds: session.activeRoleIds,
  };
}

export async function listPartners(session: SessionPayload) {
  cacheTag('partners');
  cacheLife('minutes');

  const { partners } = createPartnerMembershipServices();
  return await partners.listPartners(toStaffActor(session));
}

export async function getPartner(session: SessionPayload, partnerId: number) {
  cacheTag('partners');
  cacheLife('minutes');

  const { partners } = createPartnerMembershipServices();
  return await partners.getPartner(toStaffActor(session), partnerId);
}

export async function getPartnerSchoolProfile(session: SessionPayload, partnerId: number) {
  cacheTag('partners');
  cacheLife('minutes');

  const { partners } = createPartnerMembershipServices();
  return await partners.getPartnerSchoolProfile(toStaffActor(session), partnerId);
}

export async function listMembers(session: SessionPayload, partnerId: number) {
  cacheTag('partners');
  cacheLife('minutes');

  const { memberships } = createPartnerMembershipServices();
  return await memberships.listMembers(toStaffActor(session), partnerId);
}

export async function listPendingInvitations(session: SessionPayload, partnerId: number) {
  cacheTag('partners');
  cacheLife('minutes');

  const { invitations } = createPartnerMembershipServices();
  return await invitations.listPendingInvitations(toStaffActor(session), partnerId);
}

export async function getPartnerStaffReport(
  session: SessionPayload,
  partnerId: number,
  month?: string,
  locale: Locale = 'en',
) {
  cacheTag('partners');
  cacheLife('minutes');

  const { partnerReports } = createPartnerSalesServices();
  const actor = {
    kind: 'staff' as const,
    userId: session.userId,
    permissionCodes: session.permissionCodes,
  };
  const requested = await partnerReports.getStaffReport(actor, partnerId, { month, locale });
  return month !== undefined && !requested.success && requested.error === 'invalid-input'
    ? await partnerReports.getStaffReport(actor, partnerId, { locale })
    : requested;
}

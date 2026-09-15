import {
  createIdentityAccess,
  type IdentityStore,
  type IdentitySecurity,
} from '@findeg/backend/modules/identity-access/public';
import type { Portal } from '@findeg/backend/modules/identity-access/contracts';
import {
  createPartnerManagement,
  type PartnerStore,
  type PartnerSecurity,
} from '@findeg/backend/modules/partner-management/public';
import type {
  PartnerRole,
  PartnerStatus,
  MembershipStatus,
} from '@findeg/backend/modules/partner-management/contracts';

/** The runtime binds both owners to one transaction before invoking these operations. */
export function createPartnerOperations(
  stores: { identity: IdentityStore; partners: PartnerStore },
  security: IdentitySecurity & PartnerSecurity,
) {
  const identity = createIdentityAccess(stores.identity, security);
  const partners = createPartnerManagement(stores.partners, security);
  async function authenticated<Value>(
    token: string | undefined,
    portal: Portal,
    operation: (
      session: import('@findeg/backend/modules/identity-access/contracts').CurrentSession,
    ) => Promise<Value>,
  ) {
    // Identity authenticates; Partner Management separately establishes Workspace eligibility.
    const result = await identity.currentSession(
      token,
      portal === 'partner' ? 'storefront' : portal,
    );
    if (result.status !== 'authenticated') return result;
    return operation({ ...result.session, activePortal: portal });
  }
  return {
    currentSession: (token: string | undefined, partnerId?: number) =>
      authenticated(token, 'partner', (session) => partners.workspace(session, partnerId)),
    accessOverview: (token: string | undefined, portal: Portal, partnerId: number) =>
      authenticated(token, portal, (session) => partners.accessOverview(session, partnerId)),
    revokeInvitation: (
      token: string | undefined,
      portal: Portal,
      partnerId: number,
      invitationId: number,
    ) =>
      authenticated(token, portal, (session) =>
        partners.revokeInvitation(session, partnerId, invitationId),
      ),
    updateMembership: (
      token: string | undefined,
      portal: Portal,
      partnerId: number,
      membershipId: number,
      input: { roles: readonly PartnerRole[]; status: MembershipStatus },
    ) =>
      authenticated(token, portal, (session) =>
        partners.updateMembership(session, partnerId, membershipId, input),
      ),
    createPartner: (
      token: string | undefined,
      input: { code: string; nameEn: string; nameAr: string },
    ) => authenticated(token, 'back-office', (session) => partners.createPartner(session, input)),
    changePartnerStatus: (token: string | undefined, partnerId: number, status: PartnerStatus) =>
      authenticated(token, 'back-office', (session) =>
        partners.changePartnerStatus(session, partnerId, status),
      ),
    invite: (
      token: string | undefined,
      portal: Portal,
      partnerId: number,
      input: { email: string; roles: readonly PartnerRole[] },
    ) => authenticated(token, portal, (session) => partners.invite(session, partnerId, input)),
    acceptInvitation: (token: string | undefined, invitationToken: string) =>
      authenticated(token, 'storefront', (session) =>
        partners.acceptInvitation(session, invitationToken),
      ),
  };
}

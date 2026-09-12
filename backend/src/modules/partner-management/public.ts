import type { CurrentSession } from '../identity-access/contracts.js';
import type {
  BusinessPartner,
  PartnerMembership,
  PartnerRole,
  PartnerStatus,
  MembershipStatus,
  WorkspaceChoice,
  WorkspaceResolution,
} from './contracts.js';

export interface Invitation {
  readonly id: number;
  readonly businessPartnerId: number;
  readonly email: string;
  readonly roles: readonly PartnerRole[];
  readonly expiresAt: Date;
  readonly status: string;
  readonly inviterId: number;
  readonly createdAt: Date;
}
export interface PartnerStore {
  createPartner(input: {
    code: string;
    nameEn: string;
    nameAr: string;
  }): Promise<BusinessPartner | undefined>;
  lockPartner(id: number): Promise<BusinessPartner | undefined>;
  eligibleWorkspaces(userId: number): Promise<readonly WorkspaceChoice[]>;
  memberships(partnerId: number): Promise<readonly PartnerMembership[]>;
  changePartnerStatus(id: number, status: PartnerStatus): Promise<void>;
  issueInvitation(input: {
    businessPartnerId: number;
    email: string;
    roles: readonly PartnerRole[];
    tokenDigest: string;
    inviterId: number;
    expiresAt: Date;
  }): Promise<{ issued: Invitation; revoked: readonly Invitation[] }>;
  invitation(digest: string): Promise<Invitation | undefined>;
  acceptInvitation(invitation: Invitation, userId: number): Promise<PartnerMembership>;
  invitations(partnerId: number): Promise<readonly Invitation[]>;
  revokeInvitation(partnerId: number, invitationId: number): Promise<Invitation | undefined>;
  updateMembership(
    id: number,
    roles: readonly PartnerRole[],
    status: MembershipStatus,
  ): Promise<void>;
  accessHistory(
    partnerId: number,
  ): Promise<
    readonly { actorId: number; action: string; before: unknown; after: unknown; createdAt: Date }[]
  >;
  audit(
    partnerId: number,
    actorId: number,
    action: string,
    before: unknown,
    after: unknown,
  ): Promise<void>;
}
export interface PartnerSecurity {
  now(): Date;
  newToken(): string;
  digest(token: string): string;
  invitationLifetimeMs: number;
}
export function isPartnerRole(value: unknown): value is PartnerRole {
  return (
    typeof value === 'string' &&
    ['partner-administrator', 'list-manager', 'collection-staff', 'report-viewer'].includes(value)
  );
}
function validRoles(roles: readonly PartnerRole[]) {
  return Array.isArray(roles) && roles.length > 0 && roles.every(isPartnerRole);
}
const denied = (session: CurrentSession) => ({ status: 'authorization-denied', session }) as const;

/** Owner behavior; the application coordinator supplies an authoritative Current Session. */
export function createPartnerManagement(store: PartnerStore, security: PartnerSecurity) {
  async function workspace(
    session: CurrentSession,
    partnerId?: number,
  ): Promise<WorkspaceResolution> {
    if (!session.emailVerified) return denied(session);
    const choices = await store.eligibleWorkspaces(session.userId);
    if (partnerId === undefined && choices.length > 1)
      return { status: 'workspace-selection-required', choices };
    const chosen =
      partnerId === undefined
        ? choices[0]
        : choices.find((choice) => choice.partner.id === partnerId);
    if (!chosen) return denied(session);
    return {
      status: 'authenticated',
      session: {
        ...session,
        activePortal: 'partner',
        staffRoles: [],
        permissions: [],
        partner: {
          businessPartnerId: chosen.partner.id,
          membershipId: chosen.membership.id,
          roles: chosen.membership.roles,
          authorizationVersion:
            chosen.partner.authorizationVersion + chosen.membership.authorizationVersion,
        },
      },
    };
  }
  async function manage(session: CurrentSession, partnerId: number) {
    if (!Number.isSafeInteger(partnerId) || partnerId <= 0) return undefined;
    const partner = await store.lockPartner(partnerId);
    if (!partner) return undefined;
    if (
      session.activePortal === 'back-office' &&
      session.permissions.includes('staff-access.manage')
    )
      return partner;
    if (session.activePortal !== 'partner') return undefined;
    const access = await workspace(session, partnerId);
    return access.status === 'authenticated' &&
      access.session.partner.roles.includes('partner-administrator')
      ? partner
      : undefined;
  }
  return {
    workspace,
    async accessOverview(session: CurrentSession, partnerId: number) {
      if (!(await manage(session, partnerId))) return denied(session);
      return {
        status: 'allowed',
        memberships: await store.memberships(partnerId),
        invitations: await store.invitations(partnerId),
        history: await store.accessHistory(partnerId),
      } as const;
    },
    async revokeInvitation(session: CurrentSession, partnerId: number, invitationId: number) {
      if (!(await manage(session, partnerId))) return denied(session);
      if (!Number.isSafeInteger(invitationId) || invitationId <= 0)
        return { status: 'invalid-input' } as const;
      const invitation = await store.revokeInvitation(partnerId, invitationId);
      if (!invitation) return { status: 'invitation-unavailable' } as const;
      await store.audit(
        partnerId,
        session.userId,
        'invitation-revoked',
        { ...invitation, status: 'pending' },
        invitation,
      );
      return { status: 'revoked' } as const;
    },
    async updateMembership(
      session: CurrentSession,
      partnerId: number,
      membershipId: number,
      input: { roles: readonly PartnerRole[]; status: MembershipStatus },
    ) {
      const partner = await manage(session, partnerId);
      if (!partner) return denied(session);
      if (
        !input ||
        !validRoles(input.roles) ||
        !['active', 'suspended', 'ended'].includes(input.status)
      )
        return { status: 'invalid-input' } as const;
      const members = await store.memberships(partnerId);
      const member = members.find((m) => m.id === membershipId);
      if (!member) return { status: 'not-found' } as const;
      if (member.status === 'ended' || partner.status === 'closed')
        return { status: 'invalid-transition' } as const;
      const removesAdministrator =
        member.status === 'active' &&
        member.roles.includes('partner-administrator') &&
        (input.status !== 'active' || !input.roles.includes('partner-administrator'));
      if (
        partner.status === 'active' &&
        removesAdministrator &&
        !members.some(
          (m) =>
            m.id !== member.id &&
            m.status === 'active' &&
            m.roles.includes('partner-administrator'),
        )
      )
        return { status: 'last-administrator' } as const;
      const roles = [...new Set(input.roles)];
      await store.updateMembership(member.id, roles, input.status);
      await store.audit(partnerId, session.userId, 'membership-updated', member, {
        ...member,
        roles,
        status: input.status,
        authorizationVersion: member.authorizationVersion + 1,
      });
      return { status: 'updated' } as const;
    },
    async createPartner(
      session: CurrentSession,
      input: { code: string; nameEn: string; nameAr: string },
    ) {
      if (
        session.activePortal !== 'back-office' ||
        !session.permissions.includes('staff-access.manage')
      )
        return denied(session);
      if (
        !input ||
        !/^[a-z0-9-]{1,120}$/.test(input.code) ||
        typeof input.nameEn !== 'string' ||
        typeof input.nameAr !== 'string' ||
        !input.nameEn.trim() ||
        !input.nameAr.trim() ||
        input.nameEn.length > 200 ||
        input.nameAr.length > 200
      )
        return { status: 'invalid-input' } as const;
      const partner = await store.createPartner({
        code: input.code,
        nameEn: input.nameEn.trim(),
        nameAr: input.nameAr.trim(),
      });
      if (!partner) return { status: 'code-unavailable' } as const;
      await store.audit(partner.id, session.userId, 'partner-created', null, partner);
      return { status: 'created', partner } as const;
    },
    async changePartnerStatus(session: CurrentSession, partnerId: number, status: PartnerStatus) {
      if (
        session.activePortal !== 'back-office' ||
        !session.permissions.includes('staff-access.manage')
      )
        return denied(session);
      if (!Number.isSafeInteger(partnerId) || partnerId <= 0)
        return { status: 'invalid-input' } as const;
      const partner = await store.lockPartner(partnerId);
      if (!partner) return { status: 'not-found' } as const;
      if (!['active', 'suspended', 'closed'].includes(status) || partner.status === 'closed')
        return { status: 'invalid-transition' } as const;
      if (
        status === 'active' &&
        !(await store.memberships(partnerId)).some(
          (m) => m.status === 'active' && m.roles.includes('partner-administrator'),
        )
      )
        return { status: 'last-administrator' } as const;
      await store.changePartnerStatus(partnerId, status);
      await store.audit(
        partnerId,
        session.userId,
        'partner-status-changed',
        { status: partner.status },
        { status },
      );
      return { status: 'updated' } as const;
    },
    async invite(
      session: CurrentSession,
      partnerId: number,
      input: { email: string; roles: readonly PartnerRole[] },
    ) {
      const partner = await manage(session, partnerId);
      if (!partner) return denied(session);
      if (!['active', 'onboarding'].includes(partner.status))
        return { status: 'partner-unavailable' } as const;
      if (
        !input ||
        typeof input.email !== 'string' ||
        input.email.length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) ||
        !validRoles(input.roles)
      )
        return { status: 'invalid-input' } as const;
      const token = security.newToken();
      const email = input.email.trim().toLowerCase();
      const roles = [...new Set(input.roles)];
      const { issued, revoked } = await store.issueInvitation({
        businessPartnerId: partnerId,
        email,
        roles,
        tokenDigest: security.digest(token),
        inviterId: session.userId,
        expiresAt: new Date(security.now().getTime() + security.invitationLifetimeMs),
      });
      for (const previous of revoked)
        await store.audit(
          partnerId,
          session.userId,
          'invitation-revoked',
          { ...previous, status: 'pending' },
          previous,
        );
      await store.audit(partnerId, session.userId, 'invitation-issued', null, issued);
      return { status: 'invited', token } as const;
    },
    async acceptInvitation(session: CurrentSession, token: string) {
      if (typeof token !== 'string' || !token || token.length > 256)
        return { status: 'invitation-unavailable' } as const;
      const invitation = await store.invitation(security.digest(token));
      if (
        !invitation ||
        invitation.status !== 'pending' ||
        invitation.expiresAt <= security.now() ||
        !session.emailVerified ||
        session.email.trim().toLowerCase() !== invitation.email
      )
        return { status: 'invitation-unavailable' } as const;
      const partner = await store.lockPartner(invitation.businessPartnerId);
      if (!partner || !['active', 'onboarding'].includes(partner.status))
        return { status: 'invitation-unavailable' } as const;
      if (
        (await store.memberships(partner.id)).some(
          (m) => m.userId === session.userId && m.status !== 'ended',
        )
      )
        return { status: 'membership-exists' } as const;
      const membership = await store.acceptInvitation(invitation, session.userId);
      await store.audit(partner.id, session.userId, 'invitation-accepted', invitation, {
        invitation: { ...invitation, status: 'accepted' },
        membership,
      });
      return { status: 'accepted', membership } as const;
    },
  };
}

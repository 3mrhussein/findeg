import type { PartnerMembershipStatus, PartnerRole } from '@findeg/db/schema';
import type { PartnerResult } from './IPartnerService';

export interface PartnerSession {
  userId: number;
  user: { email: string };
  /** Authorization version signed into the session; stale values are rejected at request time. */
  tokenVersion?: number;
}

export interface PartnerMembership {
  id: number;
  businessPartnerId: number;
  userId: number;
  invitationId: number;
  roles: PartnerRole[];
  status: PartnerMembershipStatus;
  authorizationVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerContext {
  partner: {
    id: number;
    code: string;
    nameEn: string;
    nameAr: string;
    status: 'onboarding' | 'active' | 'suspended' | 'closed';
  };
  membership: PartnerMembership;
}

export type AcceptInvitationError =
  | 'not-authenticated'
  | 'not-found'
  | 'email-mismatch'
  | 'invitation-not-pending'
  | 'invitation-expired'
  | 'partner-not-open'
  | 'already-member';

export type PartnerContextError = 'not-found' | 'suspended';

/** Action classes of the partner status table (ADR-0003). */
export type PartnerAction = 'read' | 'reports' | 'membership-change' | 'business';

export type RequirePartnerRoleError = 'role-not-held' | 'partner-status-not-allowed';

export interface IMembershipService {
  acceptInvitation(
    token: string,
    session: PartnerSession | null,
  ): Promise<PartnerResult<PartnerContext, AcceptInvitationError>>;
  resolvePartnerContext(
    session: PartnerSession | null,
    code: string,
  ): Promise<PartnerResult<PartnerContext, PartnerContextError>>;
  /**
   * Role and Business Partner status check for one action class (ADR-0003 table).
   * `context` must come from `resolvePartnerContext` in the same request.
   */
  requireRole(
    context: PartnerContext,
    roles: readonly PartnerRole[] | 'any',
    action: PartnerAction,
  ): PartnerResult<PartnerContext, RequirePartnerRoleError>;
  /** The user's active memberships, for the `/partner` index and the account menu. */
  listActiveMemberships(session: PartnerSession | null): Promise<PartnerContext[]>;
}

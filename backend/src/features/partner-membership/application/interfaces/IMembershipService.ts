import type { PartnerMembershipStatus, PartnerRole } from '@findeg/db/schema';
import type { PartnerActor, PartnerResult } from './IPartnerService';

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

/** A member as the Partner Administrators' members page lists them. */
export interface PartnerMember extends PartnerMembership {
  email: string;
  firstName: string | null;
  lastName: string | null;
}

/** Omitted fields are left unchanged. Setting `status: 'ended'` removes the member for good. */
export interface UpdateMembershipInput {
  roles?: readonly PartnerRole[];
  status?: PartnerMembershipStatus;
}

export type UpdateMembershipError =
  | 'forbidden'
  | 'invalid-input'
  | 'not-found'
  | 'partner-not-open'
  | 'membership-ended'
  | 'stale-membership'
  | 'last-administrator';

export type LeaveError = Exclude<UpdateMembershipError, 'invalid-input' | 'stale-membership'>;

export interface IMembershipService {
  /**
   * Changes roles and/or status of a membership. The actor must be an active
   * Partner Administrator of its Business Partner, which must be onboarding or
   * active. `expectedVersion` is the membership's `authorizationVersion` the
   * caller loaded; any change bumps it, so a stale edit gets `stale-membership`.
   */
  updateMembership(
    actor: PartnerActor,
    membershipId: number,
    input: UpdateMembershipInput,
    expectedVersion: number,
  ): Promise<PartnerResult<PartnerMembership, UpdateMembershipError>>;
  /** A member ends their own membership. */
  leave(
    actor: PartnerActor,
    membershipId: number,
  ): Promise<PartnerResult<PartnerMembership, LeaveError>>;
  /** Current (non-ended) members of a Business Partner, for its Partner Administrators. */
  listMembers(
    actor: PartnerActor,
    partnerId: number,
  ): Promise<PartnerResult<PartnerMember[], 'forbidden'>>;
  acceptInvitation(
    token: string,
    session: PartnerSession | null,
  ): Promise<PartnerResult<PartnerContext, AcceptInvitationError>>;
  resolvePartnerContext(
    session: PartnerSession | null,
    code: string,
  ): Promise<PartnerResult<PartnerContext, 'not-found'>>;
}

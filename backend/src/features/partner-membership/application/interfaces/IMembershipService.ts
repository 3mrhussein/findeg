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

export interface IMembershipService {
  acceptInvitation(
    token: string,
    session: PartnerSession | null,
  ): Promise<PartnerResult<PartnerContext, AcceptInvitationError>>;
  resolvePartnerContext(
    session: PartnerSession | null,
    code: string,
  ): Promise<PartnerResult<PartnerContext, 'not-found'>>;
}

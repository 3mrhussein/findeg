import type { PartnerDatabase } from '@findeg/db/queries/partners';
import type { EnqueueInvitation, IInvitationService } from '../interfaces/IInvitationService';
import type { IPartnerService } from '../interfaces/IPartnerService';
import { InvitationService } from './InvitationService';
import type { IMembershipService } from '../interfaces/IMembershipService';
import { MembershipService } from './MembershipService';
import { PartnerService } from './PartnerService';

export interface PartnerServices {
  partners: IPartnerService;
  invitations: IInvitationService;
  memberships: IMembershipService;
}

export interface PartnerMembershipDependencies {
  /** Defaults to the application's shared connection. */
  db?: PartnerDatabase;
  /** Source of "now"; inject a fake to control invitation expiry. Defaults to the system clock. */
  clock?: () => Date;
  /**
   * Invitation delivery (ADR-0008). Defaults to a no-op; callers wire it to the Outbox so the
   * email row commits with the invitation. Staff can always copy the link from the token that
   * `invite` / `resendInvitation` return.
   */
  enqueue?: EnqueueInvitation;
}

export function createPartnerMembershipServices(
  dependencies: PartnerMembershipDependencies = {},
): PartnerServices {
  const { db, clock = () => new Date(), enqueue = () => {} } = dependencies;
  // `@findeg/db/connection` opens the pool and validates env on import, so it is
  // only loaded on first use when no database is injected.
  const getDb = db
    ? async () => db
    : async () => (await import('@findeg/db/connection')).db as PartnerDatabase;
  return {
    partners: new PartnerService(getDb),
    invitations: new InvitationService(getDb, clock, enqueue),
    memberships: new MembershipService(getDb, clock),
  };
}

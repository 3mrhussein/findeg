/**
 * Business Partner vocabulary (GLOSSARY: Business Partner, Partner Membership, Partner Role,
 * Partner Invitation, ADR-0003, ADR-0012).
 */

/** Where a Business Partner stands with FindEg. `closed` is final. */
export const BUSINESS_PARTNER_STATUSES = ['onboarding', 'active', 'suspended', 'closed'] as const;
export type BusinessPartnerStatus = (typeof BUSINESS_PARTNER_STATUSES)[number];

/** A person's standing inside one Business Partner. `ended` is permanent history. */
export const PARTNER_MEMBERSHIP_STATUSES = ['active', 'suspended', 'ended'] as const;
export type PartnerMembershipStatus = (typeof PARTNER_MEMBERSHIP_STATUSES)[number];

/** The four fixed responsibilities a Partner Membership can hold, several at once. */
export const PARTNER_ROLES = [
  'partner-administrator',
  'list-manager',
  'collection-staff',
  'report-viewer',
] as const;
export type PartnerRole = (typeof PARTNER_ROLES)[number];

/** The only role that manages invitations and memberships. */
export const PARTNER_ADMINISTRATOR: PartnerRole = 'partner-administrator';

/** A Business Partner that is not closed always keeps at least one active administrator. */
export const PARTNER_ADMINISTRATOR_MIN_ACTIVE = 1;

/** An invitation's link is valid for this many days after it is sent. */
export const PARTNER_INVITATION_VALID_DAYS = 7;

export const PARTNER_INVITATION_STATUSES = ['pending', 'accepted', 'revoked'] as const;
export type PartnerInvitationStatus = (typeof PARTNER_INVITATION_STATUSES)[number];

/** Who performed a Partner access-history entry. */
export const PARTNER_ACTOR_KINDS = ['staff', 'partner', 'self'] as const;
export type PartnerActorKind = (typeof PARTNER_ACTOR_KINDS)[number];

/** A person's Partner Membership in one Business Partner, as the domain sees it. */
export interface PartnerMembershipRef {
  businessPartnerId: number;
  userId: number;
  roles: readonly PartnerRole[];
  status: PartnerMembershipStatus;
}

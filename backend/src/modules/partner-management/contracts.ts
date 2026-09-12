import type { CurrentSession } from '../identity-access/contracts.js';

export type PartnerRole =
  'partner-administrator' | 'list-manager' | 'collection-staff' | 'report-viewer';
export type PartnerStatus = 'onboarding' | 'active' | 'suspended' | 'closed';
export type MembershipStatus = 'active' | 'suspended' | 'ended';
export interface BusinessPartner {
  readonly id: number;
  readonly code: string;
  readonly nameEn: string;
  readonly nameAr: string;
  readonly status: PartnerStatus;
  readonly authorizationVersion: number;
}
export interface PartnerMembership {
  readonly id: number;
  readonly businessPartnerId: number;
  readonly userId: number;
  readonly roles: readonly PartnerRole[];
  readonly status: MembershipStatus;
  readonly authorizationVersion: number;
}
export interface WorkspaceChoice {
  readonly partner: BusinessPartner;
  readonly membership: PartnerMembership;
}
export interface PartnerSession extends CurrentSession {
  readonly partner: {
    readonly businessPartnerId: number;
    readonly membershipId: number;
    readonly roles: readonly PartnerRole[];
    readonly authorizationVersion: number;
  };
}
export type WorkspaceResolution =
  | { readonly status: 'authenticated'; readonly session: PartnerSession }
  | {
      readonly status: 'workspace-selection-required';
      readonly choices: readonly WorkspaceChoice[];
    }
  | { readonly status: 'authorization-denied'; readonly session: CurrentSession };

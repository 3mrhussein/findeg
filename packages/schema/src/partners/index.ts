/**
 * Business Partner vocabulary (GLOSSARY: Business Partner, Partner School, Partner Membership,
 * Partner Role, Partner Invitation, Partner Report; ADR-0003, ADR-0010, ADR-0012).
 */
import type { Customer } from '../customers';
import type { Locale, LocalizedText } from '../common';

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

export const PARTNER_INVITATION_STATUSES = ['pending', 'accepted', 'revoked'] as const;
export type PartnerInvitationStatus = (typeof PARTNER_INVITATION_STATUSES)[number];

/** An invitation's link is valid for this many days after it is sent. */
export const PARTNER_INVITATION_VALID_DAYS = 7;

/** A Partner Report suppresses any month with fewer attributed Orders than this (ADR-0010). */
export const PARTNER_REPORT_MIN_ORDERS = 3;

export const GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Dakahlia',
  'Red Sea',
  'Sharqia',
  'Qalyubia',
  'Beheira',
  'Gharbia',
  'Faiyum',
  'Minya',
  'Asyut',
  'Sohag',
  'Qena',
  'Luxor',
  'Aswan',
] as const;
export type Governorate = (typeof GOVERNORATES)[number];

export const SCHOOL_TYPES = [
  'National',
  'International',
  'Language',
  'Private',
  'Experimental',
] as const;
export type SchoolType = (typeof SCHOOL_TYPES)[number];

export const ACADEMIC_SYSTEMS = [
  'National',
  'American',
  'British',
  'IGCSE',
  'IB',
  'French',
  'German',
  'Canadian',
] as const;
export type AcademicSystem = (typeof ACADEMIC_SYSTEMS)[number];

/** A Business Partner: the organisation FindEg has a commercial relationship with. */
export interface BusinessPartner {
  id: number;
  code: string;
  name: LocalizedText;
  status: BusinessPartnerStatus;
}

/** A Business Partner that is a school, with the details shown in the Partner School directory. */
export interface PartnerSchoolProfile {
  businessPartnerId: number;
  governorate: Governorate;
  area: LocalizedText;
  schoolType: SchoolType;
  academicSystem: AcademicSystem;
  logoUrl?: string;
}

/** A person's Partner Membership in one Business Partner. */
export interface PartnerMembership {
  businessPartnerId: number;
  customerId: Customer['id'];
  roles: readonly PartnerRole[];
  status: PartnerMembershipStatus;
}

/** An emailed offer to join a Business Partner with specific roles. Opening it never accepts it. */
export interface PartnerInvitation {
  id: number;
  businessPartnerId: number;
  email: string;
  roles: readonly PartnerRole[];
  status: PartnerInvitationStatus;
  locale: Locale;
}

/** Monthly sales of one Business Partner's School Supply Lists, as its members see them. */
export interface PartnerReport {
  businessPartnerId: number;
  /** Calendar month, `YYYY-MM`. */
  month: string;
  attributedOrderCount: number;
}

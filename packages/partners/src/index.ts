import type { PartnerDatabase } from '@findeg/db/queries/partners';
import type { EnqueueInvitation, IInvitationService } from './helpers/invitation/types';
import type { IPartnerService } from './helpers/partner/types';
import { InvitationService } from './features/invitations/index';
import type { IMembershipService } from './helpers/membership/types';
import { MembershipService } from './features/memberships/index';
import { PartnerService } from './features/partners/index';

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

// Public barrel for the Partner Membership feature (ADR-0001, ADR-0003). Only the
// factory and its consumed DTOs/types/interfaces are exported; PartnerService is
// an implementation class and stays internal to the backend package.
export type {
  EnqueueInvitation,
  IInvitationService,
  InvitationActor,
  InvitationDelivery,
  InvitationView,
  InviteError,
  InviteInput,
  IssuedInvitation,
  PartnerInvitation,
  PartnerInvitationMessage,
  PartnerRole,
  ResendError,
  RevokeError,
} from './helpers/invitation/types';
export type {
  BusinessPartner,
  ChangePartnerStatusError,
  CreatePartnerError,
  CreatePartnerInput,
  IPartnerService,
  PartnerActor,
  PartnerResult,
  ReadPartnerError,
  SavePartnerSchoolProfileError,
  SavePartnerSchoolProfileInput,
  StaffActor,
  UpdatePartnerError,
  UpdatePartnerInput,
} from './helpers/partner/types';
export type { PartnerSchoolProfileRow } from '@findeg/db/queries/partners';
export type {
  AcceptInvitationError,
  IMembershipService,
  LeaveError,
  PartnerAction,
  PartnerContext,
  PartnerContextError,
  PartnerMember,
  PartnerMembership,
  PartnerSession,
  RequirePartnerRoleError,
  UpdateMembershipError,
  UpdateMembershipInput,
} from './helpers/membership/types';
export { PARTNER_ADMINISTRATOR } from '@findeg/domain';

export * from './features/sales';
export {
  canViewPartnerReports,
  type PartnerSalesResult,
  type PartnerSalesStaffActor,
} from './helpers/access/index';
export {
  type AttributedOrderStatus,
  type AttributedOrdersError,
  type AttributedOrdersFilter,
  type AttributedOrdersView,
  type AttributedOrderTotals,
  type AttributedOrderView,
  type AttributedPaymentStatus,
  type IAttributedOrderService,
} from './features/attributed-orders/index';
export {
  canReadPartnerReports,
  MIN_DISTINCT_ORDERS_PER_SALES_ROW,
  PARTNER_REPORT_ROLES,
  REPORTED_PAYMENT_STATUSES,
  type IPartnerReportService,
  type MonthlySalesView,
  type OtherItemsView,
  type PartnerReportError,
  type PartnerReportOptions,
  type PartnerReportView,
  type PartnerSalesRowView,
  type ReportLocale,
  type SalesRowView,
  type StaffPartnerReportError,
  type StaffPartnerReportView,
} from './features/partner-report/index';
export { sumSalesFigures } from './helpers/money/index';

// Public barrel for the Partner Membership feature (ADR-0001, ADR-0003). Only the
// factory and its consumed DTOs/types/interfaces are exported; PartnerService is
// an implementation class and stays internal to the backend package.
export type {
  EnqueueInvitation,
  IInvitationService,
  InvitationActor,
  InvitationView,
  InviteError,
  InviteInput,
  IssuedInvitation,
  PartnerInvitation,
  PartnerInvitationMessage,
  PartnerRole,
  ResendError,
  RevokeError,
} from './application/interfaces/IInvitationService';
export type {
  BusinessPartner,
  CreatePartnerError,
  CreatePartnerInput,
  IPartnerService,
  PartnerActor,
  PartnerResult,
  ReadPartnerError,
  StaffActor,
  UpdatePartnerError,
  UpdatePartnerInput,
} from './application/interfaces/IPartnerService';
export type {
  AcceptInvitationError,
  IMembershipService,
  LeaveError,
  PartnerContext,
  PartnerMember,
  PartnerMembership,
  PartnerSession,
  UpdateMembershipError,
  UpdateMembershipInput,
} from './application/interfaces/IMembershipService';
export { createPartnerMembershipServices } from './application/services/factory';
export type {
  PartnerMembershipDependencies,
  PartnerServices,
} from './application/services/factory';

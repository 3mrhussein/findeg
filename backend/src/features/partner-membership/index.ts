// Public barrel for the Partner Membership feature (ADR-0001, ADR-0003). Only the
// factory and its consumed DTOs/types/interfaces are exported; PartnerService is
// an implementation class and stays internal to the backend package.
export type {
  EnqueueInvitation,
  IInvitationService,
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
  ChangePartnerStatusError,
  CreatePartnerError,
  CreatePartnerInput,
  IPartnerService,
  PartnerResult,
  ReadPartnerError,
  StaffActor,
  UpdatePartnerError,
  UpdatePartnerInput,
} from './application/interfaces/IPartnerService';
export type {
  AcceptInvitationError,
  IMembershipService,
  PartnerContext,
  PartnerMembership,
  PartnerSession,
} from './application/interfaces/IMembershipService';
export { createPartnerMembershipServices } from './application/services/factory';
export type {
  PartnerMembershipDependencies,
  PartnerServices,
} from './application/services/factory';

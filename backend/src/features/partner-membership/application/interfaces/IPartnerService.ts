import type { PartnerStatus } from '@findeg/db/schema';

/**
 * A Staff session acting on Business Partners. A `SessionPayload` satisfies this
 * shape, so dashboard code can pass its session straight in.
 */
export interface StaffActor {
  kind: 'staff';
  userId: number;
  permissionCodes?: readonly string[];
  activeRoleIds?: readonly string[];
}

export interface BusinessPartner {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  status: PartnerStatus;
  authorizationVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartnerInput {
  code: string;
  nameEn: string;
  nameAr: string;
}

/** Omitted fields are left unchanged. `code` may only change while onboarding. */
export interface UpdatePartnerInput {
  code?: string;
  nameEn?: string;
  nameAr?: string;
}

/** Typed outcome: business failures are returned, never thrown. */
export type PartnerResult<T, E extends string> =
  { success: true; data: T } | { success: false; error: E };

export type CreatePartnerError = 'forbidden' | 'invalid-input' | 'code-taken';
export type UpdatePartnerError =
  'forbidden' | 'invalid-input' | 'not-found' | 'code-locked' | 'code-taken';
export type ReadPartnerError = 'forbidden' | 'not-found';

export interface IPartnerService {
  createPartner(
    actor: StaffActor,
    input: CreatePartnerInput,
  ): Promise<PartnerResult<BusinessPartner, CreatePartnerError>>;
  updatePartner(
    actor: StaffActor,
    partnerId: number,
    input: UpdatePartnerInput,
  ): Promise<PartnerResult<BusinessPartner, UpdatePartnerError>>;
  listPartners(actor: StaffActor): Promise<PartnerResult<BusinessPartner[], 'forbidden'>>;
  getPartner(
    actor: StaffActor,
    partnerId: number,
  ): Promise<PartnerResult<BusinessPartner, ReadPartnerError>>;
}

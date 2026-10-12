import { z } from 'zod';
import {
  getBusinessPartnerById,
  hasActivePartnerAdministrator,
  insertBusinessPartner,
  insertPartnerAccessHistory,
  isPartnerCodeTakenError,
  listBusinessPartners,
  lockBusinessPartnerById,
  setBusinessPartnerStatus,
  updateBusinessPartner,
  type BusinessPartnerPatch,
  type BusinessPartnerRow,
  type PartnerDatabase,
} from '@findeg/db/queries/partners';
import type { BusinessPartnerStatus as PartnerStatus } from '@findeg/domain';
import {
  allowedPartnerStatusChanges,
  changePartnerCode,
  changePartnerStatus,
  PARTNER_CODE_MAX_LENGTH,
  PARTNER_CODE_MIN_LENGTH,
  PARTNER_CODE_PATTERN,
} from '@findeg/domain';
import type { ChangePartnerStatusError } from '../interfaces/IPartnerService';
import type {
  BusinessPartner,
  CreatePartnerInput,
  IPartnerService,
  PartnerResult,
  StaffActor,
  UpdatePartnerInput,
} from '../interfaces/IPartnerService';
import { partnerFailure } from './domain-failures';
import { canManagePartners, canViewPartners, fail, ok } from './shared';

const codeSchema = z
  .string()
  .regex(PARTNER_CODE_PATTERN)
  .min(PARTNER_CODE_MIN_LENGTH)
  .max(PARTNER_CODE_MAX_LENGTH);
const nameSchema = z.string().trim().min(1).max(255);

const createSchema = z.object({ code: codeSchema, nameEn: nameSchema, nameAr: nameSchema });
const updateSchema = z.object({
  code: codeSchema.optional(),
  nameEn: nameSchema.optional(),
  nameAr: nameSchema.optional(),
});

function toPartner(row: BusinessPartnerRow): BusinessPartner {
  return {
    id: row.id,
    code: row.code,
    nameEn: row.nameEn,
    nameAr: row.nameAr,
    status: row.status,
    authorizationVersion: row.authorizationVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** The audited fields of a partner, for `before` / `after` snapshots. */
function snapshot(row: BusinessPartnerRow) {
  return { code: row.code, nameEn: row.nameEn, nameAr: row.nameAr, status: row.status };
}

/**
 * Business Partner operations for FindEg Staff. Every change and its audit row
 * commit in one transaction; an audit row exists if and only if the change did.
 */
export class PartnerService implements IPartnerService {
  constructor(private readonly getDb: () => Promise<PartnerDatabase>) {}

  allowedStatusChanges(status: PartnerStatus): readonly PartnerStatus[] {
    return allowedPartnerStatusChanges(status);
  }

  async createPartner(actor: StaffActor, input: CreatePartnerInput) {
    if (!canManagePartners(actor)) return fail('forbidden');
    const parsed = createSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');

    try {
      const db = await this.getDb();
      const row = await db.transaction(async (tx) => {
        const created = await insertBusinessPartner(tx, parsed.data);
        await insertPartnerAccessHistory(tx, {
          businessPartnerId: created.id,
          actorUserId: actor.userId,
          actorKind: 'staff',
          action: 'partner.created',
          before: null,
          after: snapshot(created),
        });
        return created;
      });
      return ok(toPartner(row));
    } catch (error) {
      if (isPartnerCodeTakenError(error)) return fail('code-taken');
      throw error;
    }
  }

  async updatePartner(actor: StaffActor, partnerId: number, input: UpdatePartnerInput) {
    if (!canManagePartners(actor)) return fail('forbidden');
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');

    try {
      const db = await this.getDb();
      return await db.transaction(
        async (tx): Promise<PartnerResult<BusinessPartner, UpdateError>> => {
          const current = await lockBusinessPartnerById(tx, partnerId);
          if (!current) return fail('not-found');

          const patch: BusinessPartnerPatch = {};
          for (const field of ['code', 'nameEn', 'nameAr'] as const) {
            const next = parsed.data[field];
            if (next !== undefined && next !== current[field]) patch[field] = next;
          }
          if (Object.keys(patch).length === 0) return ok(toPartner(current));
          if (patch.code !== undefined) {
            try {
              changePartnerCode(current, patch.code);
            } catch (error) {
              return partnerFailure(error);
            }
          }

          const updated = await updateBusinessPartner(tx, partnerId, patch);
          const changed = Object.keys(patch) as (keyof BusinessPartnerPatch)[];
          await insertPartnerAccessHistory(tx, {
            businessPartnerId: partnerId,
            actorUserId: actor.userId,
            actorKind: 'staff',
            action: 'partner.updated',
            before: Object.fromEntries(changed.map((field) => [field, current[field]])),
            after: Object.fromEntries(changed.map((field) => [field, updated[field]])),
          });
          return ok(toPartner(updated));
        },
      );
    } catch (error) {
      if (isPartnerCodeTakenError(error)) return fail('code-taken');
      throw error;
    }
  }

  async changePartnerStatus(actor: StaffActor, partnerId: number, status: PartnerStatus) {
    if (!canManagePartners(actor)) return fail('forbidden');

    const db = await this.getDb();
    return db.transaction(
      async (tx): Promise<PartnerResult<BusinessPartner, ChangePartnerStatusError>> => {
        const current = await lockBusinessPartnerById(tx, partnerId);
        if (!current) return fail('not-found');
        // The domain needs only whether an active Partner Administrator exists, so 0 or 1 suffices.
        const administrators = (await hasActivePartnerAdministrator(tx, partnerId)) ? 1 : 0;
        let next: typeof current;
        try {
          next = changePartnerStatus(current, status, {
            activePartnerAdministrators: administrators,
          });
        } catch (error) {
          return partnerFailure(error);
        }

        const updated = await setBusinessPartnerStatus(tx, partnerId, next.status);
        await insertPartnerAccessHistory(tx, {
          businessPartnerId: partnerId,
          actorUserId: actor.userId,
          actorKind: 'staff',
          action: 'partner.status_changed',
          before: { status: current.status },
          after: { status: updated.status },
        });
        return ok(toPartner(updated));
      },
    );
  }

  async listPartners(actor: StaffActor) {
    if (!canViewPartners(actor)) return fail('forbidden');
    return ok((await listBusinessPartners(await this.getDb())).map(toPartner));
  }

  async getPartner(actor: StaffActor, partnerId: number) {
    if (!canViewPartners(actor)) return fail('forbidden');
    const row = await getBusinessPartnerById(await this.getDb(), partnerId);
    return row ? ok(toPartner(row)) : fail('not-found');
  }
}

type UpdateError = 'not-found' | 'code-locked' | 'invalid-input';

import { z } from 'zod';
import {
  getBusinessPartnerById,
  getPartnerSchoolProfile,
  hasActivePartnerAdministrator,
  insertBusinessPartner,
  insertPartnerAccessHistory,
  isPartnerCodeTakenError,
  listBusinessPartners,
  lockBusinessPartnerById,
  setBusinessPartnerStatus,
  updateBusinessPartner,
  upsertPartnerSchoolProfile,
  type BusinessPartnerPatch,
  type BusinessPartnerRow,
  type PartnerDatabase,
  type PartnerTransaction,
  type PartnerSchoolProfileRow,
} from '@findeg/db/queries/partners';
import type { BusinessPartnerStatus as PartnerStatus } from '@findeg/domain';
import {
  ACADEMIC_SYSTEMS,
  allowedPartnerStatusChanges,
  changePartnerCode,
  changePartnerStatus,
  GOVERNORATES,
  PARTNER_CODE_MAX_LENGTH,
  PARTNER_CODE_MIN_LENGTH,
  PARTNER_CODE_PATTERN,
  SCHOOL_TYPES,
} from '@findeg/domain';
import type {
  BusinessPartner,
  ChangePartnerStatusError,
  CreatePartnerInput,
  IPartnerService,
  PartnerResult,
  ReadPartnerError,
  SavePartnerSchoolProfileError,
  SavePartnerSchoolProfileInput,
  StaffActor,
  UpdatePartnerInput,
} from '../../helpers/partner/types';
import { partnerFailure } from '../../helpers/domain-failures/index';
import { canManagePartners, canViewPartners, fail, ok } from '../../helpers/shared/index';

const codeSchema = z
  .string()
  .regex(PARTNER_CODE_PATTERN)
  .min(PARTNER_CODE_MIN_LENGTH)
  .max(PARTNER_CODE_MAX_LENGTH);
const nameSchema = z.string().trim().min(1).max(255);

const profileSchema = z.object({
  governorate: z.enum(GOVERNORATES),
  area: z.string().trim().min(1).max(255),
  schoolType: z.enum(SCHOOL_TYPES),
  academicSystem: z.enum(ACADEMIC_SYSTEMS),
  logoUrl: z
    .string()
    .trim()
    .max(2048)
    .nullish()
    .transform((v) => v || null),
});

const createSchema = z.object({
  code: codeSchema,
  nameEn: nameSchema,
  nameAr: nameSchema,
  schoolProfile: profileSchema.optional(),
});
const updateSchema = z.object({
  schoolProfile: profileSchema.optional(),
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
        const { schoolProfile, ...fields } = parsed.data;
        const created = await insertBusinessPartner(tx, fields);
        const savedProfile = schoolProfile
          ? await upsertPartnerSchoolProfile(tx, {
              businessPartnerId: created.id,
              ...schoolProfile,
            })
          : undefined;
        await insertPartnerAccessHistory(tx, {
          businessPartnerId: created.id,
          actorUserId: actor.userId,
          actorKind: 'staff',
          action: 'partner.created',
          before: null,
          after: { ...snapshot(created), ...(savedProfile ? { schoolProfile: savedProfile } : {}) },
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
          if (patch.code !== undefined) {
            try {
              changePartnerCode(current, patch.code);
            } catch (error) {
              return partnerFailure<'code-locked' | 'invalid-input'>(error);
            }
          }
          if (parsed.data.schoolProfile) {
            await this.saveSchoolProfile(tx, actor, partnerId, parsed.data.schoolProfile);
          }
          if (Object.keys(patch).length === 0) return ok(toPartner(current));

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
          return partnerFailure<'invalid-transition'>(error);
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

  async savePartnerSchoolProfile(
    actor: StaffActor,
    partnerId: number,
    input: SavePartnerSchoolProfileInput,
  ): Promise<PartnerResult<PartnerSchoolProfileRow, SavePartnerSchoolProfileError>> {
    if (!canManagePartners(actor)) return fail('forbidden');
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return fail('invalid-input');

    const db = await this.getDb();
    return await db.transaction(async (tx) => {
      const partner = await lockBusinessPartnerById(tx, partnerId);
      if (!partner) return fail('not-found');

      const saved = await this.saveSchoolProfile(tx, actor, partnerId, parsed.data);
      return ok(saved);
    });
  }

  /** Call under the partner row lock; the profile and its history commit together. */
  private async saveSchoolProfile(
    tx: PartnerTransaction,
    actor: StaffActor,
    partnerId: number,
    input: SavePartnerSchoolProfileInput,
  ) {
    const previous = await getPartnerSchoolProfile(tx, partnerId);
    const next = { businessPartnerId: partnerId, ...input, logoUrl: input.logoUrl ?? null };
    if (
      previous &&
      (['governorate', 'area', 'schoolType', 'academicSystem', 'logoUrl'] as const).every(
        (field) => previous[field] === next[field],
      )
    )
      return previous;
    const saved = await upsertPartnerSchoolProfile(tx, next);
    await insertPartnerAccessHistory(tx, {
      businessPartnerId: partnerId,
      actorUserId: actor.userId,
      actorKind: 'staff',
      action: 'partner.updated',
      before: { schoolProfile: previous ?? null },
      after: { schoolProfile: saved },
    });
    return saved;
  }

  async getPartnerSchoolProfile(
    actor: StaffActor,
    partnerId: number,
  ): Promise<PartnerResult<PartnerSchoolProfileRow | null, ReadPartnerError>> {
    if (!canViewPartners(actor)) return fail('forbidden');
    const db = await this.getDb();
    const partner = await getBusinessPartnerById(db, partnerId);
    if (!partner) return fail('not-found');
    const profile = await getPartnerSchoolProfile(db, partnerId);
    return ok(profile ?? null);
  }
}

type UpdateError = 'not-found' | 'code-locked' | 'invalid-input';

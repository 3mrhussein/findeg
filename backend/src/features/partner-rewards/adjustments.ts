import {
  findRewardAdjustmentByKey,
  insertRewardAdjustment,
  type RewardsDatabase,
} from '@findeg/db/queries/rewards';
import { getBusinessPartnerById } from '@findeg/db/queries/partners';
import { PERMISSION_CODES } from '@findeg/db';
import { parseEgpPiasters } from './money';
import {
  fail,
  hasPermission,
  ok,
  type RewardRateResult,
  type RewardsStaffActor,
} from './staff-access';

export interface RewardAdjustmentView {
  readonly id: number;
  readonly businessPartnerId: number;
  /** Signed EGP in piasters. */
  readonly egpValuePiasters: bigint;
  readonly reason: string;
  readonly idempotencyKey: string;
  readonly actorUserId: number | null;
  readonly createdAt: Date;
  /** True when this call returned an adjustment an earlier call with the same key recorded. */
  readonly replayed: boolean;
}

export type AdjustRewardsError =
  'forbidden' | 'invalid-input' | 'not-found' | 'idempotency-conflict';

export interface IRewardAdjustmentService {
  /**
   * Appends a signed EGP adjustment to a Business Partner's balance. The idempotency key is unique
   * per partner and kept forever: the same key and payload replays the original, the same key with
   * a different payload is an `idempotency-conflict`.
   */
  adjust(
    actor: RewardsStaffActor,
    businessPartnerId: number,
    input: unknown,
  ): Promise<RewardRateResult<RewardAdjustmentView, AdjustRewardsError>>;
}

interface ParsedAdjustment {
  readonly egpValuePiasters: bigint;
  readonly reason: string;
  readonly idempotencyKey: string;
}

const MAX_TEXT_LENGTH = 500;

function parseAdjustment(input: unknown): ParsedAdjustment | undefined {
  if (typeof input !== 'object' || input === null) return undefined;
  const { amountEgp, reason, idempotencyKey } = input as Record<string, unknown>;
  if (typeof reason !== 'string' || typeof idempotencyKey !== 'string') return undefined;

  const egpValuePiasters = parseEgpPiasters(amountEgp);
  const trimmedReason = reason.trim();
  const trimmedKey = idempotencyKey.trim();
  if (!egpValuePiasters || !trimmedReason || !trimmedKey) return undefined;
  if (trimmedReason.length > MAX_TEXT_LENGTH || trimmedKey.length > MAX_TEXT_LENGTH) {
    return undefined;
  }

  return {
    egpValuePiasters,
    reason: trimmedReason,
    idempotencyKey: trimmedKey,
  };
}

type AdjustmentRow = NonNullable<Awaited<ReturnType<typeof insertRewardAdjustment>>>;

function toView(row: AdjustmentRow, replayed: boolean): RewardAdjustmentView {
  return {
    id: row.id,
    businessPartnerId: row.businessPartnerId,
    egpValuePiasters: row.egpValuePiasters,
    reason: row.reason ?? '',
    idempotencyKey: row.idempotencyKey ?? '',
    actorUserId: row.actorUserId,
    createdAt: row.createdAt,
    replayed,
  };
}

export class RewardAdjustmentService implements IRewardAdjustmentService {
  constructor(private readonly getDb: () => Promise<RewardsDatabase>) {}

  async adjust(actor: RewardsStaffActor, businessPartnerId: number, input: unknown) {
    if (!hasPermission(actor, PERMISSION_CODES.REWARDS_ADJUST)) return fail('forbidden');
    const adjustment = parseAdjustment(input);
    if (!adjustment || !Number.isSafeInteger(businessPartnerId) || businessPartnerId < 1) {
      return fail('invalid-input');
    }

    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');

    const inserted = await insertRewardAdjustment(db, {
      businessPartnerId,
      actorUserId: actor.userId,
      ...adjustment,
    });
    if (inserted) return ok(toView(inserted, false));

    const existing = await findRewardAdjustmentByKey(
      db,
      businessPartnerId,
      adjustment.idempotencyKey,
    );
    if (
      existing &&
      existing.egpValuePiasters === adjustment.egpValuePiasters &&
      existing.reason === adjustment.reason
    ) {
      return ok(toView(existing, true));
    }
    return fail('idempotency-conflict');
  }
}

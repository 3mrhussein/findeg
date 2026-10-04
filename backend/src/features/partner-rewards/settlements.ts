import {
  findRewardSettlementById,
  findRewardSettlementByKey,
  findRewardSettlementVoid,
  getAvailableRewardBalance,
  insertRewardSettlementLine,
  listRewardSettlementLines,
  type RewardsDatabase,
} from '@findeg/db/queries/rewards';
import { getBusinessPartnerById, lockBusinessPartnerById } from '@findeg/db/queries/partners';
import { PERMISSION_CODES } from '@findeg/db';
import type { RewardSettlementKind, RewardSettlementRow } from '@findeg/db/schema';
import { parseEgpPiasters } from './money';
import {
  canViewRewards,
  fail,
  hasPermission,
  ok,
  type RewardRateResult,
  type RewardsStaffActor,
} from './staff-access';

export interface RewardSettlementView {
  readonly id: number;
  readonly businessPartnerId: number;
  readonly kind: RewardSettlementKind;
  /** EGP in piasters: positive for a settlement or write-off, negative for a void. */
  readonly amountPiasters: bigint;
  readonly transferReference: string | null;
  /** `YYYY-MM-DD`: when Finance made the transfer. Only settlements carry it. */
  readonly paidAt: string | null;
  readonly notes: string | null;
  readonly reason: string | null;
  readonly voidsSettlementId: number | null;
  readonly idempotencyKey: string | null;
  readonly actorUserId: number | null;
  readonly createdAt: Date;
  /** True when this call returned a line an earlier call with the same key recorded. */
  readonly replayed: boolean;
}

type SettlementCommonError = 'forbidden' | 'invalid-input' | 'not-found';
export type SettleRewardsError =
  SettlementCommonError | 'idempotency-conflict' | 'exceeds-available';
export type VoidSettlementError = SettlementCommonError | 'not-voidable' | 'already-voided';
export type WriteOffRewardsError = SettlementCommonError | 'idempotency-conflict' | 'exceeds-debt';

export interface IRewardSettlementService {
  /**
   * Records a payout Finance already made off-platform. Locks the Business Partner, recomputes the
   * Available Balance and rejects an amount above it. The idempotency key is unique per partner
   * and kept forever: the same key and payload replays, a different payload conflicts.
   * `notes` is free text: never put bank account numbers in it.
   */
  settle(
    actor: RewardsStaffActor,
    businessPartnerId: number,
    input: unknown,
  ): Promise<RewardRateResult<RewardSettlementView, SettleRewardsError>>;
  /** Voids a mistaken settlement once. A void cannot be voided. */
  void(
    actor: RewardsStaffActor,
    businessPartnerId: number,
    settlementId: number,
    input: unknown,
  ): Promise<RewardRateResult<RewardSettlementView, VoidSettlementError>>;
  /** Forgives up to the current debt of a negative Available Balance. */
  writeOff(
    actor: RewardsStaffActor,
    businessPartnerId: number,
    input: unknown,
  ): Promise<RewardRateResult<RewardSettlementView, WriteOffRewardsError>>;
  /** Settlement, void and write-off lines, newest first. */
  list(
    actor: RewardsStaffActor,
    businessPartnerId: number,
  ): Promise<RewardRateResult<RewardSettlementView[], 'forbidden' | 'not-found'>>;
}

const MAX_TEXT_LENGTH = 500;
const MAX_NOTES_LENGTH = 2_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function requiredText(value: unknown, max = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max ? trimmed : undefined;
}

function optionalText(value: unknown, max: number): string | null | undefined {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length > max) return undefined;
  return trimmed || null;
}

/** A real calendar date as `YYYY-MM-DD`, or undefined. */
function parseCalendarDate(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const match = ISO_DATE.exec(value.trim());
  if (!match) return undefined;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const real =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return real ? value.trim() : undefined;
}

function record(input: unknown) {
  return typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
}

function parseSettlement(input: unknown) {
  const { amountEgp, transferReference, paidAt, notes, idempotencyKey } = record(input);
  const amountPiasters = parseEgpPiasters(amountEgp);
  const reference = requiredText(transferReference);
  const paidAtDate = parseCalendarDate(paidAt);
  const key = requiredText(idempotencyKey);
  const trimmedNotes = optionalText(notes, MAX_NOTES_LENGTH);
  if (!amountPiasters || amountPiasters < 1n || !reference || !paidAtDate || !key) return undefined;
  if (trimmedNotes === undefined) return undefined;
  return {
    amountPiasters,
    transferReference: reference,
    paidAt: paidAtDate,
    notes: trimmedNotes,
    idempotencyKey: key,
  };
}

function parseWriteOff(input: unknown) {
  const { amountEgp, reason, idempotencyKey } = record(input);
  const amountPiasters = parseEgpPiasters(amountEgp);
  const trimmedReason = requiredText(reason);
  const key = requiredText(idempotencyKey);
  if (!amountPiasters || amountPiasters < 1n || !trimmedReason || !key) return undefined;
  return { amountPiasters, reason: trimmedReason, idempotencyKey: key };
}

function toView(row: RewardSettlementRow, replayed: boolean): RewardSettlementView {
  return {
    id: row.id,
    businessPartnerId: row.businessPartnerId,
    kind: row.kind,
    amountPiasters: row.amountPiasters,
    transferReference: row.transferReference,
    paidAt: row.paidAt,
    notes: row.notes,
    reason: row.reason,
    voidsSettlementId: row.voidsSettlementId,
    idempotencyKey: row.idempotencyKey,
    actorUserId: row.actorUserId,
    createdAt: row.createdAt,
    replayed,
  };
}

export class RewardSettlementService implements IRewardSettlementService {
  constructor(private readonly getDb: () => Promise<RewardsDatabase>) {}

  async settle(actor: RewardsStaffActor, businessPartnerId: number, input: unknown) {
    if (!hasPermission(actor, PERMISSION_CODES.REWARDS_SETTLE)) return fail('forbidden');
    const settlement = parseSettlement(input);
    if (!settlement || !isPositiveId(businessPartnerId)) return fail('invalid-input');

    const db = await this.getDb();
    return db.transaction(async (tx) => {
      if (!(await lockBusinessPartnerById(tx, businessPartnerId))) return fail('not-found');

      const existing = await findRewardSettlementByKey(
        tx,
        businessPartnerId,
        settlement.idempotencyKey,
      );
      if (existing) {
        const same =
          existing.kind === 'settlement' &&
          existing.amountPiasters === settlement.amountPiasters &&
          existing.transferReference === settlement.transferReference &&
          existing.paidAt === settlement.paidAt &&
          existing.notes === settlement.notes;
        return same ? ok(toView(existing, true)) : fail('idempotency-conflict');
      }

      const available = await getAvailableRewardBalance(tx, businessPartnerId);
      if (settlement.amountPiasters > available) return fail('exceeds-available');

      const inserted = await insertRewardSettlementLine(tx, {
        ...settlement,
        businessPartnerId,
        kind: 'settlement',
        actorUserId: actor.userId,
      });
      if (!inserted) throw new Error('Settlement insert conflicted while holding the partner lock');
      return ok(toView(inserted, false));
    });
  }

  async void(
    actor: RewardsStaffActor,
    businessPartnerId: number,
    settlementId: number,
    input: unknown,
  ) {
    if (!hasPermission(actor, PERMISSION_CODES.REWARDS_SETTLE)) return fail('forbidden');
    const reason = requiredText(record(input).reason);
    if (!reason || !isPositiveId(businessPartnerId) || !isPositiveId(settlementId)) {
      return fail('invalid-input');
    }

    const db = await this.getDb();
    return db.transaction(async (tx) => {
      if (!(await lockBusinessPartnerById(tx, businessPartnerId))) return fail('not-found');

      const target = await findRewardSettlementById(tx, businessPartnerId, settlementId);
      if (!target) return fail('not-found');
      if (target.kind !== 'settlement') return fail('not-voidable');
      if (await findRewardSettlementVoid(tx, target.id)) return fail('already-voided');

      const inserted = await insertRewardSettlementLine(tx, {
        businessPartnerId,
        kind: 'void',
        amountPiasters: -target.amountPiasters,
        voidsSettlementId: target.id,
        reason,
        actorUserId: actor.userId,
      });
      if (!inserted) throw new Error('Void insert conflicted while holding the partner lock');
      return ok(toView(inserted, false));
    });
  }

  async writeOff(actor: RewardsStaffActor, businessPartnerId: number, input: unknown) {
    if (!hasPermission(actor, PERMISSION_CODES.REWARDS_SETTLE)) return fail('forbidden');
    const writeOff = parseWriteOff(input);
    if (!writeOff || !isPositiveId(businessPartnerId)) return fail('invalid-input');

    const db = await this.getDb();
    return db.transaction(async (tx) => {
      if (!(await lockBusinessPartnerById(tx, businessPartnerId))) return fail('not-found');

      const existing = await findRewardSettlementByKey(
        tx,
        businessPartnerId,
        writeOff.idempotencyKey,
      );
      if (existing) {
        const same =
          existing.kind === 'write-off' &&
          existing.amountPiasters === writeOff.amountPiasters &&
          existing.reason === writeOff.reason;
        return same ? ok(toView(existing, true)) : fail('idempotency-conflict');
      }

      const debt = -(await getAvailableRewardBalance(tx, businessPartnerId));
      if (writeOff.amountPiasters > debt) return fail('exceeds-debt');

      const inserted = await insertRewardSettlementLine(tx, {
        ...writeOff,
        businessPartnerId,
        kind: 'write-off',
        actorUserId: actor.userId,
      });
      if (!inserted) throw new Error('Write-off insert conflicted while holding the partner lock');
      return ok(toView(inserted, false));
    });
  }

  async list(actor: RewardsStaffActor, businessPartnerId: number) {
    if (!canViewRewards(actor)) return fail('forbidden');
    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');
    const rows = await listRewardSettlementLines(db, businessPartnerId);
    return ok(rows.map((row) => toView(row, false)));
  }
}

function isPositiveId(value: number) {
  return Number.isSafeInteger(value) && value > 0;
}

import {
  getCurrentRewardRate,
  getEarnedRewardTotals,
  getPendingRewardTotals,
  insertRewardRate,
  listRewardRates,
  type RewardRateRow,
  type RewardsDatabase,
} from '@findeg/db/queries/rewards';
import { getBusinessPartnerById } from '@findeg/db/queries/partners';
import { PERMISSION_CODES, type PermissionCode } from '@findeg/db';
import { parseRewardRateInput, type RewardRateInput } from './valuation';

export interface RewardsStaffActor {
  readonly userId: number;
  readonly permissionCodes?: readonly PermissionCode[];
  readonly activeRoleIds?: readonly string[];
}

export interface RewardRateView {
  readonly id: number;
  readonly businessPartnerId: number;
  readonly pointsPerEgp: string;
  readonly egpPerPoint: string;
  readonly createdByUserId: number | null;
  readonly createdAt: Date;
}

export interface PendingRewardsView {
  readonly points: bigint;
  readonly egpValuePiasters: bigint;
}

export type RewardRateResult<T, E extends string> =
  { readonly success: true; readonly data: T } | { readonly success: false; readonly error: E };

export interface IRewardRateService {
  setRate(
    actor: RewardsStaffActor,
    businessPartnerId: number,
    input: unknown,
  ): Promise<RewardRateResult<RewardRateView, 'forbidden' | 'invalid-input' | 'not-found'>>;
  getRates(
    actor: RewardsStaffActor,
    businessPartnerId: number,
  ): Promise<
    RewardRateResult<
      { current: RewardRateView | null; history: RewardRateView[] },
      'forbidden' | 'not-found'
    >
  >;
  /** Partner Points and EGP earned (Order delivered and paid) and not since reversed. */
  getEarned(
    actor: RewardsStaffActor,
    businessPartnerId: number,
  ): Promise<RewardRateResult<PendingRewardsView, 'forbidden' | 'not-found'>>;
  /** Partner Points and EGP accepted on Orders but not yet earned, paid or voided. */
  getPending(
    actor: RewardsStaffActor,
    businessPartnerId: number,
  ): Promise<RewardRateResult<PendingRewardsView, 'forbidden' | 'not-found'>>;
}

const ok = <T>(data: T) => ({ success: true, data }) as const;
const fail = <E extends string>(error: E) => ({ success: false, error }) as const;

function hasPermission(actor: RewardsStaffActor, permission: PermissionCode) {
  if (actor.activeRoleIds?.includes('system_admin')) return true;
  return actor.permissionCodes?.includes(permission) === true;
}

function toView(row: RewardRateRow): RewardRateView {
  return {
    id: row.id,
    businessPartnerId: row.businessPartnerId,
    pointsPerEgp: row.pointsPerEgp,
    egpPerPoint: row.egpPerPoint,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt,
  };
}

export class RewardRateService implements IRewardRateService {
  constructor(private readonly getDb: () => Promise<RewardsDatabase>) {}

  async setRate(actor: RewardsStaffActor, businessPartnerId: number, input: unknown) {
    if (!hasPermission(actor, PERMISSION_CODES.REWARDS_RATES_MANAGE)) return fail('forbidden');
    if (!Number.isSafeInteger(businessPartnerId) || businessPartnerId < 1) {
      return fail('invalid-input');
    }
    const rate: RewardRateInput | undefined = parseRewardRateInput(input);
    if (!rate) return fail('invalid-input');

    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');

    return ok(
      toView(
        await insertRewardRate(db, {
          businessPartnerId,
          createdByUserId: actor.userId,
          ...rate,
        }),
      ),
    );
  }

  async getRates(actor: RewardsStaffActor, businessPartnerId: number) {
    if (
      !hasPermission(actor, PERMISSION_CODES.REWARDS_VIEW) &&
      !hasPermission(actor, PERMISSION_CODES.REWARDS_RATES_MANAGE)
    ) {
      return fail('forbidden');
    }

    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');
    const [current, history] = await Promise.all([
      getCurrentRewardRate(db, businessPartnerId),
      listRewardRates(db, businessPartnerId),
    ]);
    return ok({ current: current ? toView(current) : null, history: history.map(toView) });
  }

  async getPending(actor: RewardsStaffActor, businessPartnerId: number) {
    if (
      !hasPermission(actor, PERMISSION_CODES.REWARDS_VIEW) &&
      !hasPermission(actor, PERMISSION_CODES.REWARDS_RATES_MANAGE)
    ) {
      return fail('forbidden');
    }
    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');
    return ok(await getPendingRewardTotals(db, businessPartnerId));
  }

  async getEarned(actor: RewardsStaffActor, businessPartnerId: number) {
    if (
      !hasPermission(actor, PERMISSION_CODES.REWARDS_VIEW) &&
      !hasPermission(actor, PERMISSION_CODES.REWARDS_RATES_MANAGE)
    ) {
      return fail('forbidden');
    }
    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');
    return ok(await getEarnedRewardTotals(db, businessPartnerId));
  }
}

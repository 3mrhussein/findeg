import {
  getCurrentRewardRate,
  insertRewardRate,
  listRewardRates,
  type RewardRateRow,
  type RewardsDatabase,
} from '@findeg/db/queries/rewards';
import { getBusinessPartnerById } from '@findeg/db/queries/partners';
import { parseRewardRateInput, type RewardRateInput } from './valuation';

export interface RewardsStaffActor {
  readonly userId: number;
  readonly permissionCodes?: readonly string[];
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
}

const VIEW_PERMISSION = 'rewards.view';
const MANAGE_PERMISSION = 'rewards.rates.manage';

const ok = <T>(data: T) => ({ success: true, data }) as const;
const fail = <E extends string>(error: E) => ({ success: false, error }) as const;

function hasPermission(actor: RewardsStaffActor, permission: string) {
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
    if (!hasPermission(actor, MANAGE_PERMISSION)) return fail('forbidden');
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
    if (!hasPermission(actor, VIEW_PERMISSION) && !hasPermission(actor, MANAGE_PERMISSION)) {
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
}

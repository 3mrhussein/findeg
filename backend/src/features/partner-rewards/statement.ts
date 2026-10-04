import { getAvailableRewardBalance, type RewardsDatabase } from '@findeg/db/queries/rewards';
import { getBusinessPartnerById } from '@findeg/db/queries/partners';
import {
  canViewRewards,
  fail,
  ok,
  type RewardRateResult,
  type RewardsStaffActor,
} from './staff-access';

export interface AvailableBalanceView {
  /** Signed EGP in piasters: earned − reversed ± adjustments. Pending never counts. */
  readonly egpPiasters: bigint;
}

export interface IRewardStatementService {
  getAvailableBalance(
    actor: RewardsStaffActor,
    businessPartnerId: number,
  ): Promise<RewardRateResult<AvailableBalanceView, 'forbidden' | 'not-found'>>;
}

export class RewardStatementService implements IRewardStatementService {
  constructor(private readonly getDb: () => Promise<RewardsDatabase>) {}

  async getAvailableBalance(actor: RewardsStaffActor, businessPartnerId: number) {
    if (!canViewRewards(actor)) return fail('forbidden');
    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');
    return ok({ egpPiasters: await getAvailableRewardBalance(db, businessPartnerId) });
  }
}

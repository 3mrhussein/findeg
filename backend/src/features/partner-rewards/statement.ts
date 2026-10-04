import { getAvailableRewardBalance, type RewardsDatabase } from '@findeg/db/queries/rewards';
import { getBusinessPartnerById } from '@findeg/db/queries/partners';
import { PERMISSION_CODES } from '@findeg/db';
import { isMonthKey } from './months';
import type { ReportLocale } from './sales-table';
import { readStatementAndSales, staffSource, type StatementAndSales } from './statement-and-sales';
import { readStaffReportDetail, type StaffReportDetail } from './staff-report';
import {
  canViewRewards,
  fail,
  hasPermission,
  ok,
  type RewardRateResult,
  type RewardsStaffActor,
} from './staff-access';

export interface AvailableBalanceView {
  /** Signed EGP in piasters: earned − reversed ± adjustments. Pending never counts. */
  readonly egpPiasters: bigint;
}

export interface StaffRewardReportOptions {
  /** `YYYY-MM` in Cairo time, within `months`. Defaults to the current month. */
  readonly month?: string;
  /** Language of list, item, product and variant names. Defaults to `en`. */
  readonly locale?: ReportLocale;
}

/** The Staff projection of the statement-and-sales read (ADR-0010): shared figures plus detail. */
export interface StaffRewardReportView extends StatementAndSales, StaffReportDetail {}

export type StaffRewardReportError = 'forbidden' | 'invalid-input' | 'not-found';

export interface IRewardStatementService {
  /** Monthly Reward Statement and sales for Staff holding `rewards.view`. */
  getStaffReport(
    actor: RewardsStaffActor,
    businessPartnerId: number,
    options?: StaffRewardReportOptions,
  ): Promise<RewardRateResult<StaffRewardReportView, StaffRewardReportError>>;
  getAvailableBalance(
    actor: RewardsStaffActor,
    businessPartnerId: number,
  ): Promise<RewardRateResult<AvailableBalanceView, 'forbidden' | 'not-found'>>;
}

export class RewardStatementService implements IRewardStatementService {
  constructor(
    private readonly getDb: () => Promise<RewardsDatabase>,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getStaffReport(
    actor: RewardsStaffActor,
    businessPartnerId: number,
    options: StaffRewardReportOptions = {},
  ) {
    if (!hasPermission(actor, PERMISSION_CODES.REWARDS_VIEW)) return fail('forbidden');
    if (options.month !== undefined && !isMonthKey(options.month)) return fail('invalid-input');

    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');

    const asOf = this.now();
    // One snapshot, so the statement, pending figure and live balance cannot straddle a write.
    return db.transaction(
      async (tx) => {
        const shared = await readStatementAndSales(
          tx,
          businessPartnerId,
          {
            month: options.month,
            locale: options.locale ?? 'en',
            asOf,
          },
          staffSource,
        );
        if (!shared) return fail('invalid-input');
        const detail = await readStaffReportDetail(tx, businessPartnerId, shared.statement.month);
        return ok({ ...shared, ...detail });
      },
      { isolationLevel: 'repeatable read', accessMode: 'read only' },
    );
  }

  async getAvailableBalance(actor: RewardsStaffActor, businessPartnerId: number) {
    if (!canViewRewards(actor)) return fail('forbidden');
    const db = await this.getDb();
    if (!(await getBusinessPartnerById(db, businessPartnerId))) return fail('not-found');
    return ok({ egpPiasters: await getAvailableRewardBalance(db, businessPartnerId) });
  }
}

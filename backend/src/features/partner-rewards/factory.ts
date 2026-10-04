import type { RewardsDatabase } from '@findeg/db/queries/rewards';
import { RewardAdjustmentService, type IRewardAdjustmentService } from './adjustments';
import { RewardSettlementService, type IRewardSettlementService } from './settlements';
import { RewardStatementService, type IRewardStatementService } from './statement';
import { RewardRateService, type IRewardRateService } from './rates';

export interface PartnerRewardsServices {
  rates: IRewardRateService;
  adjustments: IRewardAdjustmentService;
  settlements: IRewardSettlementService;
  statement: IRewardStatementService;
}

export interface PartnerRewardsDependencies {
  /** Defaults to the application's shared database connection. */
  db?: RewardsDatabase;
  /** Defaults to the system clock. Tests pin it to place the current Cairo month. */
  now?: () => Date;
}

export function createPartnerRewardsServices(
  dependencies: PartnerRewardsDependencies = {},
): PartnerRewardsServices {
  const getDb = dependencies.db
    ? async () => dependencies.db as RewardsDatabase
    : async () => (await import('@findeg/db/connection')).db as RewardsDatabase;
  return {
    rates: new RewardRateService(getDb),
    adjustments: new RewardAdjustmentService(getDb),
    settlements: new RewardSettlementService(getDb),
    statement: new RewardStatementService(getDb, dependencies.now),
  };
}

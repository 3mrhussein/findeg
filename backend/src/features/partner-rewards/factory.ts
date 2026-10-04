import type { RewardsDatabase } from '@findeg/db/queries/rewards';
import { RewardRateService, type IRewardRateService } from './rates';

export interface PartnerRewardsServices {
  rates: IRewardRateService;
}

export interface PartnerRewardsDependencies {
  /** Defaults to the application's shared database connection. */
  db?: RewardsDatabase;
}

export function createPartnerRewardsServices(
  dependencies: PartnerRewardsDependencies = {},
): PartnerRewardsServices {
  const getDb = dependencies.db
    ? async () => dependencies.db as RewardsDatabase
    : async () => (await import('@findeg/db/connection')).db as RewardsDatabase;
  return { rates: new RewardRateService(getDb) };
}

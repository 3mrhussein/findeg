import {
  createIdentityAccess,
  type SessionStore,
  type SessionSecurity,
} from '@findeg/backend/modules/identity-access/public';
import type { PartnerStore } from '@findeg/backend/modules/partner-management/public';
import {
  rewardRateInput,
  type DurablePartnerRewardStore,
} from '@findeg/backend/modules/partner-rewards/public';

export function createRewardRateOperations(
  stores: { identity: SessionStore; partners: PartnerStore; rewards: DurablePartnerRewardStore },
  security: SessionSecurity,
) {
  return {
    async configure(token: string | undefined, partnerId: number, input: unknown) {
      const access = await createIdentityAccess(stores.identity, security).authorize(
        token,
        'back-office',
        'finance.manage',
      );
      if (access.status !== 'authenticated') return access;
      const rate = rewardRateInput(input);
      if (!Number.isSafeInteger(partnerId) || partnerId < 1 || !rate)
        return { status: 'invalid-input' } as const;
      const partner = await stores.partners.lockPartner(partnerId);
      if (!partner || partner.status !== 'active')
        return { status: 'partner-unavailable' } as const;
      return stores.rewards.configureRate(partnerId, access.session.userId, rate);
    },
  };
}

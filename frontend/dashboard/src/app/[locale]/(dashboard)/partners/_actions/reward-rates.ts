'use server';

import { revalidatePath } from 'next/cache';
import type { Locale } from 'next-intl';
import { PERMISSION_CODES } from '@findeg/backend/features/core';
import { createPartnerRewardsServices } from '@findeg/backend/features/partner-rewards';
import { requirePermission } from '@lib/auth-guard';
import type { RewardRateFormState } from '../_components/RewardRatesPanel';

export async function saveRewardRateAction(
  locale: Locale,
  partnerId: number,
  _previous: RewardRateFormState,
  formData: FormData,
): Promise<RewardRateFormState> {
  const session = await requirePermission(locale, {
    permission: PERMISSION_CODES.REWARDS_RATES_MANAGE,
  });
  const result = await createPartnerRewardsServices().rates.setRate(session, partnerId, {
    pointsPerEgp: String(formData.get('pointsPerEgp') ?? '').trim(),
    egpPerPoint: String(formData.get('egpPerPoint') ?? '').trim(),
  });

  if (!result.success) {
    const messages = {
      forbidden: 'You do not have permission to manage Reward Rates.',
      'invalid-input':
        'Enter positive decimal values: up to 6 whole and 6 decimal digits for points, and 8 whole and 4 decimal digits for EGP.',
      'not-found': 'This Business Partner no longer exists.',
    } as const;
    return { status: 'error', message: messages[result.error] };
  }

  revalidatePath('/[locale]/partners/[id]', 'page');
  return { status: 'saved', message: 'Reward Rate added to the history.' };
}

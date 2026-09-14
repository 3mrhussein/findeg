import type { TransactionRunner } from './transactions.js';
import {
  createIdentityAccess,
  type SessionSecurity,
  type SessionStore,
} from '@findeg/backend/modules/identity-access/public';
import type { PartnerStore } from '@findeg/backend/modules/partner-management/public';
import type {
  DurablePartnerRewardStore,
  PartnerRewardCorrectionInput,
  VerifiedBankAccountInput,
} from '@findeg/backend/modules/partner-rewards/public';

interface RewardStores {
  identity: SessionStore;
  partners: PartnerStore;
  rewards: DurablePartnerRewardStore;
}

const key = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
const account = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
const reference = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
const reason = (value: unknown): value is string | undefined =>
  value === undefined ||
  (typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 500);

function correction(value: unknown): PartnerRewardCorrectionInput | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const input = value as Record<string, unknown>;
  if (
    Object.keys(input).some(
      (field) =>
        ![
          'key',
          'action',
          'orderReference',
          'points',
          'reason',
          'verifiedBankAccountId',
          'settlementReference',
        ].includes(field),
    ) ||
    !key(input.key) ||
    !['refund', 'cancellation', 'reversal', 'adjustment', 'settlement'].includes(
      input.action as string,
    ) ||
    !reference(input.orderReference) ||
    typeof input.points !== 'number' ||
    !Number.isSafeInteger(input.points) ||
    input.points === 0 ||
    !reason(input.reason)
  )
    return undefined;
  const settlement = input.action === 'settlement';
  const bankAccountId = account(input.verifiedBankAccountId)
    ? input.verifiedBankAccountId
    : undefined;
  const settlementReference = reference(input.settlementReference)
    ? input.settlementReference
    : undefined;
  if (
    (settlement &&
      (!Number.isSafeInteger(input.points) ||
        input.points <= 0 ||
        !bankAccountId ||
        !reference(settlementReference))) ||
    (!settlement &&
      (input.verifiedBankAccountId !== undefined ||
        input.settlementReference !== undefined ||
        (input.action !== 'adjustment' && input.points < 0)))
  )
    return undefined;
  return {
    key: input.key,
    action: input.action as PartnerRewardCorrectionInput['action'],
    orderReference: input.orderReference,
    points: input.points,
    ...(input.reason === undefined ? {} : { reason: input.reason.trim() }),
    ...(bankAccountId === undefined ? {} : { verifiedBankAccountId: bankAccountId }),
    ...(settlementReference === undefined ? {} : { settlementReference }),
  };
}

function verification(value: unknown): VerifiedBankAccountInput | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const input = value as Record<string, unknown>;
  return Object.keys(input).every((field) => ['key', 'bankAccountId'].includes(field)) &&
    key(input.key) &&
    account(input.bankAccountId)
    ? { key: input.key, bankAccountId: input.bankAccountId }
    : undefined;
}

export function createPartnerRewardOperations(
  transactions: TransactionRunner<RewardStores>,
  security: SessionSecurity,
) {
  async function run<T extends { status: string }>(
    operation: (stores: RewardStores) => Promise<T>,
  ): Promise<T> {
    const outcome = await transactions.run<T, T>(async (stores) => {
      const value = await operation(stores);
      return [
        'bank-account-verified',
        'refunded',
        'cancelled',
        'reversed',
        'recorded',
        'settled',
        'authentication-required',
        'authorization-denied',
      ].includes(value.status)
        ? { ok: true, value }
        : { ok: false, error: value };
    });
    return outcome.ok ? outcome.value : outcome.error;
  }
  async function authorize(stores: RewardStores, token: string | undefined, partnerId: number) {
    const access = await createIdentityAccess(stores.identity, security).authorize(
      token,
      'back-office',
      'finance.manage',
    );
    if (access.status !== 'authenticated') return access;
    if (!Number.isSafeInteger(partnerId) || partnerId < 1)
      return { status: 'invalid-input' } as const;
    const partner = await stores.partners.lockPartner(partnerId);
    if (!partner || partner.status !== 'active') return { status: 'partner-unavailable' } as const;
    return { status: 'authenticated' as const, actorId: access.session.userId };
  }
  return {
    verifyBankAccount(token: string | undefined, partnerId: number, input: unknown) {
      return run(async (stores) => {
        const access = await authorize(stores, token, partnerId);
        if (access.status !== 'authenticated') return access;
        const parsed = verification(input);
        if (!parsed) return { status: 'invalid-input' } as const;
        return stores.rewards.verifyBankAccount({
          partnerId,
          actorId: access.actorId,
          fingerprint: security.digest(
            JSON.stringify({ partnerId, bankAccountId: parsed.bankAccountId }),
          ),
          verification: parsed,
        });
      });
    },
    correct(token: string | undefined, partnerId: number, input: unknown) {
      return run(async (stores) => {
        const access = await authorize(stores, token, partnerId);
        if (access.status !== 'authenticated') return access;
        const parsed = correction(input);
        if (!parsed) return { status: 'invalid-input' } as const;
        return stores.rewards.recordCorrection({
          partnerId,
          actorId: access.actorId,
          fingerprint: security.digest(
            JSON.stringify({
              partnerId,
              action: parsed.action,
              orderReference: parsed.orderReference,
              points: parsed.points,
              reason: parsed.reason,
              verifiedBankAccountId: parsed.verifiedBankAccountId,
              settlementReference: parsed.settlementReference,
            }),
          ),
          correction: parsed,
        });
      });
    },
  };
}

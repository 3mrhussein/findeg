export type PartnerRewardEventType =
  'accepted' | 'paid' | 'refund' | 'cancellation' | 'reversal' | 'adjustment' | 'settlement';

export interface PartnerRewardEvent {
  readonly partnerId: number;
  readonly orderReference: string;
  readonly eventType: PartnerRewardEventType;
  readonly points: number;
  readonly pendingPoints?: number;
  readonly earnedPoints?: number;
  readonly conversionRate?: number;
  readonly fulfillment?: 'delivery' | 'collection';
  readonly fulfillmentCompleted?: boolean;
  readonly verifiedBankAccountId?: string;
  readonly settlementReference?: string;
  readonly createdAt: Date;
  readonly reason?: string;
}

export interface PartnerRewardSummary {
  readonly pending: number;
  readonly earned: number;
  readonly reversed: number;
  readonly settled: number;
  readonly available: number;
}

export interface PartnerRewardInput {
  readonly orderReference: string;
  readonly points: number;
  readonly conversionRate?: number;
}

export interface PartnerPaymentInput {
  readonly paidAt?: Date;
  readonly points?: number;
  readonly fulfillment: 'delivery' | 'collection';
  readonly fulfillmentCompleted: boolean;
}

export interface PartnerAdjustmentInput {
  readonly orderReference: string;
  readonly points: number;
  readonly reason?: string;
  readonly verifiedBankAccountId?: string;
  readonly settlementReference?: string;
}

export type PartnerRewardCorrectionAction =
  | 'refund'
  | 'cancellation'
  | 'reversal'
  | 'adjustment'
  | 'settlement';

/** Finance supplies a durable key for each correction or completed settlement. */
export interface PartnerRewardCorrectionInput {
  readonly key: string;
  readonly action: PartnerRewardCorrectionAction;
  readonly orderReference: string;
  readonly points: number;
  readonly reason?: string;
  readonly verifiedBankAccountId?: string;
  readonly settlementReference?: string;
}

export interface VerifiedBankAccountInput {
  readonly key: string;
  readonly bankAccountId: string;
}

export type PartnerRewardCorrectionResult =
  | { readonly status: 'refunded' }
  | { readonly status: 'cancelled' }
  | { readonly status: 'reversed' }
  | { readonly status: 'recorded' }
  | { readonly status: 'settled' }
  | { readonly status: 'bank-account-unverified' }
  | { readonly status: 'reward-unavailable' }
  | { readonly status: 'idempotency-conflict' };

/** Exact business policy: six decimal points per EGP, four decimal EGP per point. */
export interface PartnerRewardRate {
  readonly id: number;
  readonly businessPartnerId: number;
  readonly pointsPerEgp: string;
  readonly egpPerPoint: string;
}
export interface RewardSnapshot {
  readonly rateId: number;
  readonly pointsPerEgp: string;
  readonly egpPerPoint: string;
  readonly points: number;
  readonly rewardValue: string;
}
export interface PendingRewardLine {
  readonly lineIndex: number;
  readonly businessPartnerId: number;
  readonly eligibleSubtotal: string;
  readonly reward: RewardSnapshot;
}
export interface RewardEntitlement extends PendingRewardLine {
  readonly id: number;
  readonly orderReference: string;
}
export interface RewardRateInput {
  readonly key: string;
  readonly pointsPerEgp: string;
  readonly egpPerPoint: string;
}

/** Decimal strings preserve exact totals beyond JavaScript's safe integer range. */
export interface RewardStatementBalances {
  readonly pending: string;
  readonly earned: string;
  readonly reversed: string;
  readonly settled: string;
  readonly available: string;
}
export interface RewardStatement {
  readonly points: RewardStatementBalances;
  /** Null when historical ledger entries have no recorded valuation. Never invent a rate. */
  readonly value: RewardStatementBalances | null;
}

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

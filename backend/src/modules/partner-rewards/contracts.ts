export type PartnerRewardEventType =
  'accepted' | 'paid' | 'refund' | 'reversal' | 'adjustment' | 'settlement';

export interface PartnerRewardEvent {
  readonly partnerId: number;
  readonly orderReference: string;
  readonly eventType: PartnerRewardEventType;
  readonly points: number;
  readonly pendingPoints?: number;
  readonly earnedPoints?: number;
  readonly conversionRate?: number;
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
}

export interface PartnerAdjustmentInput {
  readonly orderReference: string;
  readonly points: number;
  readonly reason?: string;
}

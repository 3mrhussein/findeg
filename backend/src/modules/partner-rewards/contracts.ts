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

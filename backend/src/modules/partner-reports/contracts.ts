export interface PartnerReportRow {
  readonly partnerId: number;
  readonly period: string;
  readonly count: number;
  readonly totalPoints: number;
  readonly customerName?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly deliveryStreet?: string;
  readonly deliveryCity?: string;
}

export interface PartnerReportOptions {
  readonly minimumCount?: number;
}

export interface PartnerReportResult {
  readonly rows: readonly PartnerReportRow[];
  readonly suppressed: boolean;
}

export interface AttributedSalesBreakdown {
  readonly day: string;
  readonly listId: number;
  readonly listItemId: number;
  readonly variantId: number;
  readonly count: number;
  readonly subtotal: string;
}
export interface PartnerStatementReport {
  readonly partnerId: number;
  readonly period: string;
  readonly statement: import('../partner-rewards/contracts.js').RewardStatement;
  readonly sales: readonly AttributedSalesBreakdown[];
  readonly suppressed: boolean;
}

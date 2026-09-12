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

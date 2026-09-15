import { summarizeRewardStatement } from '../partner-rewards/public.js';
import type { PartnerSession } from '../partner-management/contracts.js';
import type { PartnerReportOptions, PartnerReportResult, PartnerReportRow } from './contracts.js';

export type { PartnerReportOptions, PartnerReportResult, PartnerReportRow } from './contracts.js';

export type PartnerReportAccessResult =
  | { readonly status: 'authorized'; readonly report: PartnerReportResult }
  | { readonly status: 'authorization-denied' };

export function sanitizePartnerReportRow(
  row: PartnerReportRow,
): Pick<PartnerReportRow, 'partnerId' | 'period' | 'count' | 'totalPoints'> {
  return {
    partnerId: row.partnerId,
    period: row.period,
    count: row.count,
    totalPoints: row.totalPoints,
  };
}

function filterPartnerReportRows(
  rows: readonly PartnerReportRow[],
  minimumCount: number,
): readonly PartnerReportRow[] {
  return rows
    .filter((row) => row.count >= minimumCount)
    .map((row) => sanitizePartnerReportRow(row));
}

export function buildPartnerReports(
  rows: readonly PartnerReportRow[],
  options: PartnerReportOptions = {},
): PartnerReportResult {
  const minimumCount = options.minimumCount ?? 3;
  const filtered = filterPartnerReportRows(rows, minimumCount);
  return {
    rows: filtered,
    suppressed: rows.some((row) => row.count < minimumCount),
  };
}

export function buildAuthorizedPartnerReports(
  session: PartnerSession,
  partnerId: number,
  rows: readonly PartnerReportRow[],
  options: PartnerReportOptions = {},
): PartnerReportAccessResult {
  const authorized =
    session.partner.businessPartnerId === partnerId &&
    session.partner.roles.some(
      (role) => role === 'partner-administrator' || role === 'report-viewer',
    );
  if (!authorized) return { status: 'authorization-denied' };

  const partnerRows = rows.filter((row) => row.partnerId === partnerId);
  return { status: 'authorized', report: buildPartnerReports(partnerRows, options) };
}

export function suppressLowCountBreakdowns(
  rows: readonly PartnerReportRow[],
  minimumCount = 3,
): readonly PartnerReportRow[] {
  return filterPartnerReportRows(rows, minimumCount);
}

export interface PartnerReportStore {
  eventsThrough(
    partnerId: number,
    before: Date,
  ): Promise<
    readonly (import('../partner-rewards/contracts.js').PartnerRewardEvent & {
      readonly value: string | null;
    })[]
  >;
  salesDuring(
    partnerId: number,
    start: string,
    end: string,
  ): Promise<readonly import('./contracts.js').AttributedSalesBreakdown[]>;
}

export async function readPartnerStatement(
  store: PartnerReportStore,
  partnerId: number,
  period: string,
): Promise<import('./contracts.js').PartnerStatementReport> {
  const start = `${period}-01`;
  const endDate = new Date(`${start}T00:00:00.000Z`);
  endDate.setUTCMonth(endDate.getUTCMonth() + 1);
  const end = endDate.toISOString().slice(0, 10);
  const events = await store.eventsThrough(partnerId, endDate);
  const sales = await store.salesDuring(partnerId, start, end);
  return {
    partnerId,
    period,
    statement: summarizeRewardStatement(events.filter((event) => event.partnerId === partnerId)),
    sales: sales.filter((row) => row.count >= 3),
    suppressed: sales.some((row) => row.count < 3),
  };
}

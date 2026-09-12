import type { PartnerReportOptions, PartnerReportResult, PartnerReportRow } from './contracts.js';

export type { PartnerReportOptions, PartnerReportResult, PartnerReportRow } from './contracts.js';

export function sanitizePartnerReportRow<T extends PartnerReportRow>(
  row: T,
): Omit<T, 'customerName' | 'email' | 'phone' | 'deliveryStreet' | 'deliveryCity'> {
  const {
    customerName: _customerName,
    email: _email,
    phone: _phone,
    deliveryStreet: _deliveryStreet,
    deliveryCity: _deliveryCity,
    ...rest
  } = row;
  return rest;
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

export function suppressLowCountBreakdowns(
  rows: readonly PartnerReportRow[],
  minimumCount = 3,
): readonly PartnerReportRow[] {
  return filterPartnerReportRows(rows, minimumCount);
}

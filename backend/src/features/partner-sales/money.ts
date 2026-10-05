interface SalesFigure {
  readonly quantity: number;
  readonly chargedPiasters: bigint;
}

/** Exact piasters as EGP text, never through a JavaScript number. */
export function piastersToEgp(piasters: bigint): string {
  const sign = piasters < 0n ? '-' : '';
  const absolute = piasters < 0n ? -piasters : piasters;
  return `${sign}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, '0')}`;
}

/** Totals shared by the Staff and Business Partner report projections. */
export function sumSalesFigures(rows: readonly SalesFigure[]): SalesFigure {
  return rows.reduce(
    (total, row) => ({
      quantity: total.quantity + row.quantity,
      chargedPiasters: total.chargedPiasters + row.chargedPiasters,
    }),
    { quantity: 0, chargedPiasters: 0n },
  );
}

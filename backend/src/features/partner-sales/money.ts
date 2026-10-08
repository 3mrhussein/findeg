interface SalesFigure {
  readonly quantity: number;
  readonly chargedPiasters: bigint;
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

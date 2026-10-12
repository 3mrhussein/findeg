/**
 * Units of one variant on one line: a Cart line, a School Supply List item, a Quote or Order
 * line, and the stock allocated for it. Every line holds a whole number from 1 to 999.
 */
export const LINE_QUANTITY_MIN = 1;
export const LINE_QUANTITY_MAX = 999;

/** Whether `quantity` is a line quantity: a whole number from 1 to 999. */
export function isLineQuantity(quantity: number): boolean {
  return (
    Number.isInteger(quantity) && quantity >= LINE_QUANTITY_MIN && quantity <= LINE_QUANTITY_MAX
  );
}

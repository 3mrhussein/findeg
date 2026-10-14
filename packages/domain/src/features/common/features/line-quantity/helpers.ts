import { LINE_QUANTITY_MAX, LINE_QUANTITY_MIN } from './constants';

/** Whether `quantity` is a line quantity: a whole number from 1 to 999. */
export function isLineQuantity(quantity: number): boolean {
  return (
    Number.isInteger(quantity) && quantity >= LINE_QUANTITY_MIN && quantity <= LINE_QUANTITY_MAX
  );
}

import { LINE_QUANTITY_MAX, LINE_QUANTITY_MIN } from '../../../common';
import type { Cart } from './types';

/** A Cart line holds a line quantity: 1 to 999 units. */
export const CART_QUANTITY_MIN = LINE_QUANTITY_MIN;
export const CART_QUANTITY_MAX = LINE_QUANTITY_MAX;

export const EMPTY_CART: Cart = { lines: [] };

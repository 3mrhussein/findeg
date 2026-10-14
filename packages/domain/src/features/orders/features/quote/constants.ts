import { moneyFromDecimal, type Money } from '../../../common';
import type { DiscountSource } from '../../types';

/** The flat delivery fee on every Order. */
export const FLAT_SHIPPING_FEE: Money = moneyFromDecimal('50.00');

export const LIST_OFFER: DiscountSource = 'list-offer';

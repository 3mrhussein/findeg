import type { SchoolSupplyListItem } from './index';
import { LINE_QUANTITY_MAX, LINE_QUANTITY_MIN, isLineQuantity } from '../common';
import { SupplyListError } from './supply-list-error';

/** A list item prescribes a line quantity: 1 to 999 units. */
export const SUPPLY_LIST_ITEM_QUANTITY_MIN = LINE_QUANTITY_MIN;
export const SUPPLY_LIST_ITEM_QUANTITY_MAX = LINE_QUANTITY_MAX;

/** An item is an Exact Item when it has no specification: only its default variant is accepted. */
export function isExactItem(item: Pick<SchoolSupplyListItem, 'specification'>): boolean {
  return item.specification === null;
}

/** A School Supply List Item, checked: its quantity is a whole number from 1 to 999. */
export function supplyListItem(props: SchoolSupplyListItem): SchoolSupplyListItem {
  const { quantity } = props;
  if (!isLineQuantity(quantity)) {
    throw new SupplyListError(
      'INVALID_ITEM_QUANTITY',
      `An item quantity is a whole number from ${SUPPLY_LIST_ITEM_QUANTITY_MIN} to ${SUPPLY_LIST_ITEM_QUANTITY_MAX}, received ${quantity}`,
    );
  }
  return { ...props };
}

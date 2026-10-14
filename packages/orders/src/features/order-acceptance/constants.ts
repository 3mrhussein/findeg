export const ORDER_ACCEPTED_KIND = 'order-accepted';

/** Row id for an order's confirmation email: one per Order Reference. */
export const orderAcceptedId = (orderReference: string) =>
  `${ORDER_ACCEPTED_KIND}:${orderReference}`;

export const ORDER_SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Order created successfully',
} as const;

export const accountSelectors = {
  orderCardById: (id: number) => `[data-testid="my-account-order-card-${id}"]`,
  orderDetailHeading: '[data-testid="my-account-order-detail-heading"]',
} as const;

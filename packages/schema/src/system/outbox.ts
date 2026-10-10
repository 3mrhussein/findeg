/** Outbox (GLOSSARY: Outbox, ADR-0008): messages committed with a change and delivered at least once. */
export const OUTBOX_STATUSES = [
  'pending',
  'processing',
  'delivered',
  'exhausted',
  'expired',
] as const;
export type OutboxStatus = (typeof OUTBOX_STATUSES)[number];

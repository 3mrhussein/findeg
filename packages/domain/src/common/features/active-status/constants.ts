/**
 * Whether a catalogue entry or a warehouse is in use. Inactive things are kept but not sold,
 * shown or stocked from. "Draft" is a School Supply List term and never applies here.
 */
export const ACTIVE_STATUSES = ['active', 'inactive'] as const;

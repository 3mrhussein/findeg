import * as constants from './constants';

/**
 * Where an Order's Stock Reservation stands. It is never stored: it follows from the Order
 * status (ADR-0005). It is held from Order Acceptance, consumed on delivery (the units leave
 * the warehouse) and released on cancellation (the units can be sold again).
 */
export type ReservationState = (typeof constants.RESERVATION_STATES)[number];

/** How a held reservation is settled: `consume` lowers on hand and reserved, `release` only reserved. */
export type ReservationSettlement = 'consume' | 'release';

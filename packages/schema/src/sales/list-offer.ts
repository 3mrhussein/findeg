/** List Offer (GLOSSARY: List Offer): a percentage discount on one School Supply List. */

/** Basis points: 100 = 1%, 10000 = 100%. */
export const LIST_OFFER_MIN_BASIS_POINTS = 0;
export const LIST_OFFER_MAX_BASIS_POINTS = 10000;

/** A List Offer is the only discount source in phase one (GLOSSARY: Quote). */
export const DISCOUNT_SOURCES = ['list-offer'] as const;
export type DiscountSource = (typeof DISCOUNT_SOURCES)[number];

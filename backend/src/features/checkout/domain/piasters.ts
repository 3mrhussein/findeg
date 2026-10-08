/**
 * Quote pricing in integer piasters (ADR-0007). A Quote carries BigInt piasters end to end; the
 * exact conversions to and from decimal text live in `@findeg/money`, so no `number` arithmetic
 * or `toFixed` touches an amount. Checkout owns the pricing and summing below.
 */

import { fromPiasters, toPiasters } from '@findeg/money';
import type { CheckoutQuote } from '../schemas';

const DECIMAL_PRICE = /^\d+(\.\d{1,2})?$/;

/**
 * Converts the configured shipping fee (a number or an env string) to piasters once.
 * Anything that is not a non-negative amount with at most two decimals is rejected, never rounded.
 */
export function shippingFeeToPiasters(fee: number | string): bigint {
  const text = typeof fee === 'number' ? String(fee) : fee.trim();
  if (!DECIMAL_PRICE.test(text)) {
    throw new Error(
      `Invalid shipping fee ${JSON.stringify(fee)}: expected a non-negative amount with at most 2 decimals`,
    );
  }
  return toPiasters(text);
}

export interface PricedLine {
  gross: bigint;
  lineTotal: bigint;
  discount: bigint;
}

const BASIS_POINTS = 10_000n;

/** `gross x (10000 - bps) / 10000`, rounded half-up to a piaster once for the whole line. */
export function priceLine(
  unitPrice: bigint,
  quantity: number,
  basisPoints: number | null,
): PricedLine {
  const gross = unitPrice * BigInt(quantity);
  if (basisPoints === null) return { gross, lineTotal: gross, discount: 0n };
  const lineTotal =
    (gross * (BASIS_POINTS - BigInt(basisPoints)) + BASIS_POINTS / 2n) / BASIS_POINTS;
  return { gross, lineTotal, discount: gross - lineTotal };
}

export interface PiasterQuoteLine {
  listItemId?: number;
  variantId: number;
  quantity: number;
  unitPrice: bigint;
  discounts: Array<{ source: string; amount: bigint }>;
  lineTotal: bigint;
}

export interface PiasterQuote {
  lines: PiasterQuoteLine[];
  shipping: bigint;
  subtotal: bigint;
  total: bigint;
  currency: 'EGP';
  confirmation: string;
}

/** A line's total discount across every source. */
export function lineDiscount(line: PiasterQuoteLine): bigint {
  return line.discounts.reduce((sum, discount) => sum + discount.amount, 0n);
}

/** Subtotal, shipping and total for priced lines; the single place both Quote paths sum. */
export function sumQuote(lines: PiasterQuoteLine[], shipping: bigint) {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0n);
  return { subtotal, shipping, total: subtotal + shipping };
}

/** The Customer-facing Quote: piasters rendered as numbers, the one conversion out of BigInt. */
export function toCheckoutQuote(quote: PiasterQuote): CheckoutQuote {
  return {
    lines: quote.lines.map((line) => ({
      ...(line.listItemId === undefined ? {} : { listItemId: line.listItemId }),
      variantId: line.variantId,
      quantity: line.quantity,
      unitPrice: fromPiasters(line.unitPrice),
      discounts: line.discounts.map((d) => ({ source: d.source, amount: fromPiasters(d.amount) })),
      lineTotal: fromPiasters(line.lineTotal),
    })),
    shipping: fromPiasters(quote.shipping),
    subtotal: fromPiasters(quote.subtotal),
    total: fromPiasters(quote.total),
    currency: quote.currency,
    confirmation: quote.confirmation,
  };
}

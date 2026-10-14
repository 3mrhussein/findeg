import { BUSINESS_TIME_ZONE } from './constants';

// en-CA formats a calendar date as YYYY-MM-DD, so no part-by-part assembly is needed.
const dateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** The Cairo calendar date of an instant, written `YYYY-MM-DD`. */
export function businessDateOf(instant: Date): string {
  return dateFormat.format(instant);
}

/** The Cairo calendar month of an instant, written `YYYY-MM`. */
export function businessMonthOf(instant: Date): string {
  return dateFormat.format(instant).slice(0, 7);
}

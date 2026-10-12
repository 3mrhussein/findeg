/** FindEg's business time zone. Every business date and month is a Cairo date and month. */
export const BUSINESS_TIME_ZONE = 'Africa/Cairo';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function cairoParts(instant: Date): { year: string; month: string; day: string } {
  const parts = dateFormat.formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)!.value;
  return { year: part('year'), month: part('month'), day: part('day') };
}

/** The Cairo calendar date of an instant, written `YYYY-MM-DD`. */
export function businessDateOf(instant: Date): string {
  const { year, month, day } = cairoParts(instant);
  return `${year}-${month}-${day}`;
}

/** The Cairo calendar month of an instant, written `YYYY-MM`. */
export function businessMonthOf(instant: Date): string {
  const { year, month } = cairoParts(instant);
  return `${year}-${month}`;
}

/** Every day and month boundary in Partner Rewards reports is Egypt time (ADR-0010). */
export const REWARDS_TIME_ZONE = 'Africa/Cairo';

const MONTH_KEY = /^(\d{4})-(0[1-9]|1[0-2])$/;

const monthFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: REWARDS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
});

/** `YYYY-MM` of an instant in Cairo time. */
export function cairoMonthOf(instant: Date): string {
  const parts = monthFormat.formatToParts(instant);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  return `${year}-${month}`;
}

export function isMonthKey(value: unknown): value is string {
  return typeof value === 'string' && MONTH_KEY.test(value);
}

/** Every `YYYY-MM` from `first` to `last`, inclusive and ascending. */
export function monthsBetween(first: string, last: string): string[] {
  const months: string[] = [];
  let [year, month] = first.split('-').map(Number);
  for (let key = first; key <= last; key = `${year}-${String(month).padStart(2, '0')}`) {
    months.push(key);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
}

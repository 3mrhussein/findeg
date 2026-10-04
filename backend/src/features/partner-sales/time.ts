/** Every calendar day and month in Partner Sales is Egypt time (ADR-0010, ADR-0013). */
export const PARTNER_SALES_TIME_ZONE = 'Africa/Cairo';

const MONTH_KEY = /^(\d{4})-(0[1-9]|1[0-2])$/;
const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

const monthFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: PARTNER_SALES_TIME_ZONE,
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

/** A real calendar date written `YYYY-MM-DD`. */
export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = DATE_KEY.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** The first and last calendar day of a `YYYY-MM` month. */
export function monthRange(month: string): { from: string; to: string } {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}` };
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

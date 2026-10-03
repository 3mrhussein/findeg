import type { ListOfferInput } from '@findeg/backend/features/school';

export type OfferFormParse = { ok: true; offer: ListOfferInput } | { ok: false; message: string };

/** `YYYY-MM-DDTHH:mm` from a datetime-local input, read as UTC so the stored window is unambiguous. */
function parseUtc(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats a stored instant for a datetime-local input (UTC). */
export function toUtcInputValue(date: Date | null): string {
  return date ? date.toISOString().slice(0, 16) : '';
}

/** Reads the percent (0 to 100, up to two decimals) and UTC window from the offer form. */
export function parseOfferForm(formData: FormData): OfferFormParse {
  const percent = String(formData.get('percent') ?? '').trim();
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(percent) || Number(percent) > 100) {
    return { ok: false, message: 'Enter a discount between 0 and 100 percent.' };
  }
  const startsAt = parseUtc(String(formData.get('startsAt') ?? '').trim());
  if (!startsAt) return { ok: false, message: 'Enter a start date and time.' };
  const endsRaw = String(formData.get('endsAt') ?? '').trim();
  const endsAt = endsRaw === '' ? null : parseUtc(endsRaw);
  if (endsRaw !== '' && !endsAt) return { ok: false, message: 'Enter a valid end date and time.' };
  if (endsAt && endsAt <= startsAt) {
    return { ok: false, message: 'The end must be after the start.' };
  }
  return { ok: true, offer: { basisPoints: Math.round(Number(percent) * 100), startsAt, endsAt } };
}

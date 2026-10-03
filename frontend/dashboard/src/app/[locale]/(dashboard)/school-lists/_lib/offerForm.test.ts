import { describe, expect, it } from 'vitest';
import { parseOfferForm, toUtcInputValue } from './offerForm';

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe('parseOfferForm', () => {
  it('converts percent to basis points and reads the window as UTC', () => {
    expect(
      parseOfferForm(
        form({ percent: '12.5', startsAt: '2026-10-01T09:30', endsAt: '2026-11-01T00:00' }),
      ),
    ).toEqual({
      ok: true,
      offer: {
        basisPoints: 1250,
        startsAt: new Date('2026-10-01T09:30:00.000Z'),
        endsAt: new Date('2026-11-01T00:00:00.000Z'),
      },
    });
  });

  it('treats an empty end as open-ended and accepts the 0 and 100 extremes', () => {
    const zero = parseOfferForm(form({ percent: '0', startsAt: '2026-10-01T00:00', endsAt: '' }));
    expect(zero).toMatchObject({ ok: true, offer: { basisPoints: 0, endsAt: null } });
    const full = parseOfferForm(form({ percent: '100', startsAt: '2026-10-01T00:00' }));
    expect(full).toMatchObject({ ok: true, offer: { basisPoints: 10000 } });
  });

  it.each(['', '-1', '100.01', '101', 'abc', '1.234', '1e2'])('rejects percent %j', (percent) => {
    expect(parseOfferForm(form({ percent, startsAt: '2026-10-01T00:00' })).ok).toBe(false);
  });

  it('rejects a missing start and an end that is not after it', () => {
    expect(parseOfferForm(form({ percent: '10', startsAt: '' })).ok).toBe(false);
    expect(
      parseOfferForm(
        form({ percent: '10', startsAt: '2026-10-01T00:00', endsAt: '2026-10-01T00:00' }),
      ).ok,
    ).toBe(false);
    expect(
      parseOfferForm(form({ percent: '10', startsAt: '2026-10-01T00:00', endsAt: 'soon' })).ok,
    ).toBe(false);
  });
});

describe('toUtcInputValue', () => {
  it('round-trips with the parser', () => {
    const date = new Date('2026-10-01T09:30:00.000Z');
    expect(toUtcInputValue(date)).toBe('2026-10-01T09:30');
    expect(toUtcInputValue(null)).toBe('');
  });
});

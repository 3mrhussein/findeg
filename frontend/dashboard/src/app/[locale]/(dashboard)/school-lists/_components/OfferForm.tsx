'use client';
import type { Locale } from '@findeg/domain';
import { useActionState } from 'react';
import { Button, Input, Label, formatEgp } from '@findeg/ui';
import { useLocale, useTranslations } from 'next-intl';
import { clearOfferAction, saveOfferAction, type OfferFormState } from '../_actions/offer';

interface OfferFormProps {
  listId: number;
  canEdit: boolean;
  offer: { percent: string; startsAt: string; endsAt: string } | null;
}

const initialState: OfferFormState = { status: 'idle' };

/** Edits a list's List Offer. Times are UTC; the offer changes without republishing the list. */
export function OfferForm({ listId, canEdit, offer }: OfferFormProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('SchoolLists');
  const [state, saveAction, saving] = useActionState(
    saveOfferAction.bind(null, locale, listId),
    initialState,
  );
  const [, clearAction, clearing] = useActionState(
    clearOfferAction.bind(null, locale, listId),
    initialState,
  );

  const discountPercentNum = offer ? Number(offer.percent) : 0;
  const samplePiasters = 10000n;
  const discountedPiasters = BigInt(Math.max(0, 10000 - Math.round(discountPercentNum * 100)));

  return (
    <div className="max-w-xl space-y-4" data-testid="offer-form">
      {offer && (
        <div
          className="rounded-lg border bg-muted/40 p-4 space-y-2"
          data-testid="current-offer-card"
        >
          <div className="font-semibold text-sm">
            {t('ActiveDiscount', { percent: offer.percent })}
          </div>
          <div className="text-xs text-muted-foreground">
            {offer.endsAt
              ? t('FiniteWindow', { start: offer.startsAt, end: offer.endsAt })
              : t('OpenEndedWindow', { start: offer.startsAt })}
          </div>
          <div className="text-xs text-muted-foreground" data-testid="offer-money-example">
            {t('MoneyExample', {
              original: formatEgp(samplePiasters),
              discounted: formatEgp(discountedPiasters),
            })}
          </div>
        </div>
      )}

      <form action={saveAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="percent">{t('DiscountPercent')}</Label>
          <Input
            id="percent"
            name="percent"
            inputMode="decimal"
            defaultValue={offer?.percent}
            disabled={!canEdit}
            required
            dir="ltr"
            placeholder="10"
            data-testid="offer-percent-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startsAt">{t('StartsUtc')}</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={offer?.startsAt}
            disabled={!canEdit}
            required
            data-testid="offer-starts-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">{t('EndsUtc')}</Label>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={offer?.endsAt}
            disabled={!canEdit}
            data-testid="offer-ends-input"
          />
          <p className="text-sm text-muted-foreground">{t('EndsHelp')}</p>
        </div>
        {state.status === 'error' && (
          <p role="alert" className="text-sm text-destructive" data-testid="offer-error-alert">
            {state.message}
          </p>
        )}
        {state.status === 'saved' && (
          <p className="text-sm text-green-700 dark:text-green-400" data-testid="offer-saved-alert">
            {t('OfferSaved')}
          </p>
        )}
        {canEdit && (
          <Button type="submit" disabled={saving} data-testid="save-offer-btn">
            {saving ? t('Save') : offer ? t('SaveOffer') : t('CreateOffer')}
          </Button>
        )}
      </form>
      {canEdit && offer && (
        <form action={clearAction}>
          <Button
            type="submit"
            variant="outline"
            disabled={clearing}
            data-testid="remove-offer-btn"
          >
            {clearing ? t('RemoveOffer') : t('RemoveOffer')}
          </Button>
        </form>
      )}
    </div>
  );
}

'use client';

import { useActionState } from 'react';
import { Button, Input, Label } from '@findeg/ui';
import { useLocale } from 'next-intl';
import { clearOfferAction, saveOfferAction, type OfferFormState } from '../_actions/offer';

interface OfferFormProps {
  listId: number;
  canEdit: boolean;
  offer: { percent: string; startsAt: string; endsAt: string } | null;
}

const initialState: OfferFormState = { status: 'idle' };

/** Edits a list's List Offer. Times are UTC; the offer changes without republishing the list. */
export function OfferForm({ listId, canEdit, offer }: OfferFormProps) {
  const locale = useLocale();
  const [state, saveAction, saving] = useActionState(
    saveOfferAction.bind(null, locale, listId),
    initialState,
  );
  const [, clearAction, clearing] = useActionState(
    clearOfferAction.bind(null, locale, listId),
    initialState,
  );

  return (
    <div className="max-w-xl space-y-4" data-testid="offer-form">
      <form action={saveAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="percent">Discount (%)</Label>
          <Input
            id="percent"
            name="percent"
            inputMode="decimal"
            defaultValue={offer?.percent}
            disabled={!canEdit}
            required
            dir="ltr"
            placeholder="10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startsAt">Starts (UTC)</Label>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={offer?.startsAt}
            disabled={!canEdit}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endsAt">Ends (UTC, optional)</Label>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={offer?.endsAt}
            disabled={!canEdit}
          />
          <p className="text-sm text-muted-foreground">
            Leave empty for an open-ended offer. The offer applies to every line of the list while
            the order is accepted between the start and the end.
          </p>
        </div>
        {state.status === 'error' && (
          <p role="alert" className="text-sm text-red-600">
            {state.message}
          </p>
        )}
        {state.status === 'saved' && <p className="text-sm text-green-700">Offer saved.</p>}
        {canEdit && (
          <Button type="submit" disabled={saving}>
            {offer ? 'Save offer' : 'Create offer'}
          </Button>
        )}
      </form>
      {canEdit && offer && (
        <form action={clearAction}>
          <Button type="submit" variant="outline" disabled={clearing}>
            Remove offer
          </Button>
        </form>
      )}
    </div>
  );
}

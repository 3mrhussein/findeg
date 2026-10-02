'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type {
  PublicSupplyList,
  PublicSupplyListItem,
  PublicSupplyListVariant,
} from '@findeg/backend/features/school';
import { Link } from '@/i18n/navigation';
import {
  chooseVariant,
  loadSelection,
  saveSelection,
  seedSelection,
  setEnabled,
  setQuantity,
  syncSelectionIndex,
  MAX_QUANTITY,
  MIN_QUANTITY,
  type ListSelection,
} from '@/lib/list-selection/list-selection';

type Text = { en?: string; ar?: string } | null | undefined;

function pick(text: Text, locale: string): string {
  if (!text) return '';
  return (locale === 'ar' ? text.ar : text.en) || text.en || text.ar || '';
}

/** Signed price difference from the default, e.g. `+2.50`, `-1.00`, `0.00`. */
function priceDifference(price: string, defaultPrice: string): string {
  const diff = Number(price) - Number(defaultPrice);
  const text = Math.abs(diff).toFixed(2);
  if (diff > 0) return `+${text}`;
  if (diff < 0) return `-${text}`;
  return text;
}

/**
 * The School Supply List: each item at the school's default, filled in through
 * a List Selection held in this browser. The Customer changes an item's
 * variant among the eligible ones, toggles optional items and sets quantities.
 */
export function SupplyListView({ list, locale }: { list: PublicSupplyList; locale: string }) {
  const t = useTranslations('School.ParentExperience.PublicList');
  const archived = list.status === 'archived';
  const schoolName = locale === 'ar' ? list.school.nameAr : list.school.nameEn;

  const [selection, setSelection] = useState<ListSelection>(() => seedSelection(list));
  const [ineligible, setIneligible] = useState<number[]>([]);
  const [changing, setChanging] = useState<number | null>(null);

  // Load and reconcile on every load; storage is only readable in the browser.
  useEffect(() => {
    const loaded = loadSelection(list, window.localStorage);
    setSelection(loaded.selection);
    setIneligible(loaded.flaggedItemIds);
  }, [list]);

  const update = (next: ListSelection) => {
    setSelection(next);
    saveSelection(list.publicCode, next, window.localStorage);
    syncSelectionIndex(
      list.publicCode,
      next,
      list,
      { title: pick(list.title, locale), schoolName },
      window.localStorage,
    );
  };

  // A switched-off optional line was never chosen, so it only blocks checkout once turned on.
  const flagged = ineligible.filter((id) =>
    selection.lines.some((line) => line.listItemId === id && line.quantity > 0),
  );

  const variantName = (variant: PublicSupplyListVariant) =>
    [pick(variant.name, locale), pick(variant.variantLabel, locale)].filter(Boolean).join(' – ');

  const chosenVariant = (item: PublicSupplyListItem, variantId: number) =>
    item.eligibleVariants.find((variant) => variant.variantId === variantId) ??
    (item.defaultVariant.variantId === variantId ? item.defaultVariant : null);

  const choose = (item: PublicSupplyListItem, variantId: number) => {
    update(chooseVariant(selection, item.id, variantId));
    setIneligible((ids) => ids.filter((id) => id !== item.id));
    setChanging(null);
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {archived && (
        <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-semibold">{t('Archived')}</p>
          {list.replacementPublicCode ? (
            <Link href={`/lists/${list.replacementPublicCode}`} className="text-primary underline">
              {t('ViewReplacement')}
            </Link>
          ) : (
            <p>{t('NoReplacement')}</p>
          )}
        </div>
      )}

      <header className="space-y-1">
        <h1 className="text-3xl font-black">{pick(list.title, locale)}</h1>
        <p className="text-muted-foreground">
          {schoolName} &middot; {list.grade} &middot; {list.academicYear}
        </p>
      </header>

      <ul className="space-y-4">
        {list.items.map((item) => {
          const line = selection.lines.find((candidate) => candidate.listItemId === item.id);
          if (!line) return null;
          const enabled = line.quantity > 0;
          const isFlagged = flagged.includes(item.id);
          const variant = chosenVariant(item, line.variantId);
          const canChange = !item.exactItem && !archived;

          return (
            <li key={item.id} className="space-y-2 rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-bold">{pick(item.label, locale)}</h2>
                {item.required ? (
                  <span className="text-sm">{t('Required')}</span>
                ) : (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={archived}
                      onChange={(event) =>
                        update(setEnabled(selection, list, item.id, event.target.checked))
                      }
                    />
                    {t('Optional')}
                  </label>
                )}
              </div>

              <p>{variant ? variantName(variant) : t('VariantUnknown')}</p>
              {variant && (
                <p className="text-sm text-muted-foreground">
                  {variant.price}
                  {variant.variantId !== item.defaultVariant.variantId &&
                    ` (${priceDifference(variant.price, item.defaultVariant.price)})`}
                </p>
              )}

              {isFlagged && (
                <p role="alert" className="text-sm font-semibold text-destructive">
                  {t('UnavailableChooseAgain')}
                </p>
              )}
              {item.exactItem && <p className="text-sm">{t('ExactItem')}</p>}
              {variant && !variant.inStock && (
                <p className="text-sm text-destructive">{t('OutOfStock')}</p>
              )}

              {enabled && (
                <label className="flex items-center gap-2 text-sm">
                  {t('QuantityLabel')}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={MIN_QUANTITY}
                    max={MAX_QUANTITY}
                    defaultValue={line.quantity}
                    disabled={archived}
                    onChange={(event) => {
                      // An empty field is mid-edit: keep the stored quantity until a number is typed.
                      if (event.target.value === '') return;
                      update(setQuantity(selection, item.id, Number(event.target.value)));
                    }}
                    onBlur={(event) => {
                      event.target.value = String(line.quantity);
                    }}
                    className="w-20 rounded border px-2 py-1"
                  />
                  <span className="text-muted-foreground">
                    {t('Prescribed', { count: item.quantity })}
                  </span>
                </label>
              )}

              {canChange && (
                <div>
                  <button
                    type="button"
                    aria-expanded={changing === item.id}
                    onClick={() => setChanging(changing === item.id ? null : item.id)}
                    className="text-sm text-primary underline"
                  >
                    {t('Change')}
                  </button>
                  {changing === item.id && (
                    <ul className="mt-2 space-y-2">
                      {item.eligibleVariants.map((option) => {
                        const differing = Object.entries(option.differingAttributes);
                        return (
                          <li key={option.variantId}>
                            <button
                              type="button"
                              disabled={!option.inStock}
                              aria-pressed={option.variantId === line.variantId}
                              onClick={() => choose(item, option.variantId)}
                              className="w-full rounded-lg border p-2 text-start disabled:opacity-50"
                            >
                              <span className="block font-medium">{variantName(option)}</span>
                              <span className="block text-sm text-muted-foreground">
                                {option.price} (
                                {priceDifference(option.price, item.defaultVariant.price)})
                                {option.brand && ` · ${pick(option.brand, locale)}`}
                              </span>
                              {differing.length > 0 && (
                                <span className="block text-sm text-muted-foreground">
                                  {differing.map(([key, value]) => `${key}: ${value}`).join(', ')}
                                </span>
                              )}
                              {!option.inStock && (
                                <span className="block text-sm text-destructive">
                                  {t('OutOfStock')}
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-muted-foreground">{t('PriceNote')}</p>

      <div>
        <button
          type="button"
          disabled
          className="rounded-xl bg-primary px-6 py-3 font-bold text-white opacity-50"
        >
          {t('Checkout')}
        </button>
        <p className="mt-2 text-sm text-muted-foreground">
          {archived
            ? t('CheckoutArchived')
            : flagged.length > 0
              ? t('CheckoutBlockedByUnavailable')
              : t('CheckoutSoon')}
        </p>
      </div>
    </div>
  );
}

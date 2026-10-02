import { useTranslations } from 'next-intl';
import type { PublicSupplyList, PublicSupplyListVariant } from '@findeg/backend/features/school';
import { Link } from '@/i18n/navigation';

type Text = { en?: string; ar?: string } | null | undefined;

function pick(text: Text, locale: string): string {
  if (!text) return '';
  return (locale === 'ar' ? text.ar : text.en) || text.en || text.ar || '';
}

/**
 * The School Supply List read-only: each item at the school's default. The
 * substitute picker, selection and completeness arrive in later slices.
 */
export function SupplyListView({ list, locale }: { list: PublicSupplyList; locale: string }) {
  const t = useTranslations('School.ParentExperience.PublicList');
  const archived = list.status === 'archived';
  const schoolName = locale === 'ar' ? list.school.nameAr : list.school.nameEn;

  const variantName = (variant: PublicSupplyListVariant) =>
    [pick(variant.name, locale), pick(variant.variantLabel, locale)].filter(Boolean).join(' – ');

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
        {list.items.map((item) => (
          <li key={item.id} className="space-y-1 rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bold">{pick(item.label, locale)}</h2>
              <span className="text-sm">{item.required ? t('Required') : t('Optional')}</span>
            </div>
            <p>{variantName(item.defaultVariant)}</p>
            <p className="text-sm text-muted-foreground">
              {t('Quantity', { count: item.quantity })} &middot; {item.defaultVariant.price}
            </p>
            {item.exactItem && <p className="text-sm">{t('ExactItem')}</p>}
            {!item.defaultVariant.inStock && (
              <p className="text-sm text-destructive">{t('OutOfStock')}</p>
            )}
          </li>
        ))}
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
          {archived ? t('CheckoutArchived') : t('CheckoutSoon')}
        </p>
      </div>
    </div>
  );
}

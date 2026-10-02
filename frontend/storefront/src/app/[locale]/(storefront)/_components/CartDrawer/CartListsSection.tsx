'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { readSelectionIndex, type SelectionIndexEntry } from '@/lib/list-selection/list-selection';

/**
 * "Your school lists": a link to each in-progress List Selection, read from the
 * browser's selection index. Lists the Customer only visited are not in it.
 */
export function CartListsSection() {
  const t = useTranslations('Pages.Cart');
  const [entries, setEntries] = useState<SelectionIndexEntry[]>([]);

  useEffect(() => {
    setEntries(readSelectionIndex(window.localStorage));
  }, []);

  if (entries.length === 0) return null;

  return (
    <section className="space-y-3 py-6" data-testid="cart-school-lists">
      <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">
        {t('YourSchoolLists')}
      </h5>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.publicCode}>
            <Link
              href={`/lists/${entry.publicCode}`}
              className="block rounded-xl border border-primary/10 bg-primary/5 p-3 text-sm"
            >
              <span className="block font-bold">{entry.title}</span>
              <span className="block text-xs text-muted-foreground">{entry.schoolName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

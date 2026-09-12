'use client';

import { useEffect, useState } from 'react';

interface Variant {
  id: number;
  sku: string;
  name: string;
  label: string;
  price: string;
  strikePrice?: string;
  available: number;
}

export function CatalogBrowser({ locale }: { locale: 'en' | 'ar' }) {
  const [variants, setVariants] = useState<readonly Variant[] | undefined>();
  useEffect(() => {
    fetch(`/api/v1/catalog?locale=${locale}`)
      .then((response) => response.json())
      .then(setVariants)
      .catch(() => setVariants([]));
  }, [locale]);
  const arabic = locale === 'ar';
  return (
    <section aria-label={arabic ? 'الكتالوج' : 'Catalog'}>
      <h2>{arabic ? 'المنتجات المتاحة' : 'Available products'}</h2>
      {!variants ? <p>{arabic ? 'جارٍ تحميل المنتجات…' : 'Loading products…'}</p> : null}
      {variants?.length === 0 ? (
        <p>{arabic ? 'لا توجد منتجات متاحة الآن.' : 'No products are available yet.'}</p>
      ) : null}
      {variants?.length ? (
        <ul className="catalog-list">
          {variants.map((variant) => (
            <li key={variant.id}>
              <strong>{variant.name}</strong> — {variant.label} ({variant.sku}) · {variant.price}{' '}
              EGP {variant.strikePrice ? <del>{variant.strikePrice} EGP</del> : null} ·{' '}
              {arabic ? `${variant.available} متاح` : `${variant.available} available`}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

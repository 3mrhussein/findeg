'use client';

import Image from 'next/image';
import { Link } from '@i18n/navigation';
import type { Product } from '@/data/catalog/types';
import { useCart } from '@hooks/useCart';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@findeg/ui';
import { Badge } from '@findeg/ui';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

/**
 *
 */
export function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  const { addToCart } = useCart();
  const t = useTranslations('Pages.ProductCard');
  const locale = useLocale();

  const variants = product.variants || [];
  const defaultVariant = variants.find((v) => v.isDefault) || variants[0];
  const displayPrice = Number(defaultVariant?.basePrice ?? 0);
  const imageUrl =
    defaultVariant?.images?.[0]?.url ||
    `https://picsum.photos/seed/${product.id}/600/600`;

  const isNew = !!product.isNew;
  const href = `/shop/products/${product.slug}`;

  if (layout === 'list') {
    return (
      <div
        className="group relative flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md"
        data-testid={`product-card-${product.id}`}
      >
        <div className="relative shrink-0 w-full sm:w-[200px] aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
          {isNew && (
            <Badge className="absolute top-2 left-2 z-10 uppercase tracking-wide">
              {t('NewBadge')}
            </Badge>
          )}
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 200px"
          />
        </div>

        <div className="flex flex-1 flex-col justify-between py-2">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {product.categoryName || t('DefaultCategory')}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 mb-2">
              <Link href={href} data-testid={`product-card-title-${product.id}`}>
                <span aria-hidden="true" className="absolute inset-0 z-0"></span>
                {product.name}
              </Link>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
              {product.description || 'High quality premium item.'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 relative z-20">
            <p
              className="text-lg font-black text-slate-900 dark:text-white"
              data-testid={`product-card-price-${product.id}`}
            >
              {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                style: 'currency',
                currency: 'EGP',
              }).format(displayPrice)}
            </p>
            <Button
              onClick={() =>
                defaultVariant &&
                addToCart(product.id, 1, {
                  variantId: defaultVariant.id,
                })
              }
              disabled={!defaultVariant}
              data-testid={`product-card-add-${product.id}`}
              className="bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-6"
            >
              <span className="material-symbols-outlined text-[18px] mr-2">add_shopping_cart</span>
              {t('AddToCart')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative" data-testid={`product-card-${product.id}`}>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
        {isNew && (
          <Badge className="absolute top-3 left-3 z-10 uppercase tracking-wide">
            {t('NewBadge')}
          </Badge>
        )}

        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <Button
          onClick={() =>
            defaultVariant &&
            addToCart(product.id, 1, {
              variantId: defaultVariant.id,
            })
          }
          disabled={!defaultVariant}
          data-testid={`product-card-add-${product.id}`}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 w-[90%] bg-surface-light dark:bg-surface-dark text-slate-900 dark:text-white shadow-lg font-bold hover:bg-slate-50 z-20 rounded-full"
        >
          <span className="material-symbols-outlined text-[18px] mr-2">add_shopping_cart</span>
          {t('AddToCart')}
        </Button>
      </div>

      <div className="mt-4 flex justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {product.categoryName || t('DefaultCategory')}
          </div>
          <h3 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
            <Link href={href} data-testid={`product-card-title-${product.id}`}>
              <span aria-hidden="true" className="absolute inset-0 z-0"></span>
              {product.name}
            </Link>
          </h3>
        </div>
        <p
          className="text-sm font-bold text-slate-900 dark:text-white shrink-0"
          data-testid={`product-card-price-${product.id}`}
        >
          {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
            style: 'currency',
            currency: 'EGP',
          }).format(displayPrice)}
        </p>
      </div>
    </div>
  );
}

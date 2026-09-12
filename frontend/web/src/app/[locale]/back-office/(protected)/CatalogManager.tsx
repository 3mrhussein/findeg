'use client';

import { useEffect, useState } from 'react';

interface ManageableVariant {
  id: number;
  productId: number;
  productName: { en: string; ar: string };
  sku: string;
  variantKey: string;
  label: { en: string; ar: string };
  basePrice: string;
  strikePrice?: string;
  isActive: boolean;
}

async function submit(path: string, body: object, method = 'POST') {
  const response = await fetch(path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.errorCode ?? 'request-failed');
  return result;
}

async function loadVariants() {
  const response = await fetch('/api/v1/back-office/catalog/variants');
  if (!response.ok) throw new Error('request-failed');
  return (await response.json()) as readonly ManageableVariant[];
}

export function CatalogManager({ locale }: { locale: 'en' | 'ar' }) {
  const [message, setMessage] = useState<string>();
  const [variants, setVariants] = useState<readonly ManageableVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<number>();
  const arabic = locale === 'ar';
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId);
  const activeVariants = variants.filter((variant) => variant.isActive);

  useEffect(() => {
    loadVariants()
      .then((loadedVariants) => {
        setVariants(loadedVariants);
        setSelectedVariantId(loadedVariants[0]?.id);
      })
      .catch(() => setMessage(arabic ? 'تعذر تحميل المتغيرات.' : 'Could not load variants.'));
  }, [arabic]);

  return (
    <section className="catalog-manager">
      <h2>{arabic ? 'إدارة المخزون والمنتجات' : 'Catalog and inventory management'}</h2>
      <div>
        <h3>{arabic ? 'المتغيرات الحالية' : 'Existing variants'}</h3>
        {variants.length === 0 ? (
          <p>{arabic ? 'لا توجد متغيرات بعد.' : 'No variants found.'}</p>
        ) : (
          <ul>
            {variants.map((variant) => (
              <li key={variant.id}>
                <button type="button" onClick={() => setSelectedVariantId(variant.id)}>
                  {variant.productName[locale]} · {variant.label[locale]} ({variant.sku})
                </button>{' '}
                <span>
                  {variant.isActive ? (arabic ? 'نشط' : 'Active') : arabic ? 'متوقف' : 'Inactive'}
                </span>{' '}
                <span>
                  {variant.basePrice} EGP
                  {variant.strikePrice ? ` (${variant.strikePrice} EGP)` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          try {
            const result = await submit('/api/v1/back-office/catalog/variants', {
              productId: Number(data.get('productId')),
              sku: data.get('sku'),
              variantKey: data.get('variantKey'),
              label: { en: data.get('labelEn'), ar: data.get('labelAr') },
              basePrice: data.get('basePrice'),
              strikePrice: data.get('strikePrice') || undefined,
              isActive: true,
            });
            setMessage(
              arabic
                ? `تم إنشاء المتغير ${result.variantId}.`
                : `Variant ${result.variantId} created.`,
            );
            const refreshed = await loadVariants();
            setVariants(refreshed);
            setSelectedVariantId(result.variantId);
            event.currentTarget.reset();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'request-failed');
          }
        }}
      >
        <h3>{arabic ? 'متغير منتج جديد' : 'New Product Variant'}</h3>
        <label>
          {arabic ? 'معرّف المنتج' : 'Product ID'}
          <input name="productId" type="number" min="1" required />
        </label>
        <label>
          SKU
          <input name="sku" required />
        </label>
        <label>
          {arabic ? 'المفتاح' : 'Variant key'}
          <input name="variantKey" required />
        </label>
        <label>
          {arabic ? 'الاسم بالإنجليزية' : 'English label'}
          <input name="labelEn" required />
        </label>
        <label>
          {arabic ? 'الاسم بالعربية' : 'Arabic label'}
          <input name="labelAr" required />
        </label>
        <label>
          {arabic ? 'السعر بالجنيه' : 'Price (EGP)'}
          <input name="basePrice" inputMode="decimal" required />
        </label>
        <label>
          {arabic ? 'السعر السابق (اختياري)' : 'Strike price (optional)'}
          <input name="strikePrice" inputMode="decimal" />
        </label>
        <button type="submit">{arabic ? 'إنشاء المتغير' : 'Create variant'}</button>
      </form>
      <form
        key={selectedVariant?.id ?? 'update'}
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          try {
            await submit(
              '/api/v1/back-office/catalog/variants',
              {
                variantId: Number(data.get('variantId')),
                sku: data.get('sku'),
                variantKey: data.get('variantKey'),
                label: { en: data.get('labelEn'), ar: data.get('labelAr') },
                basePrice: data.get('basePrice'),
                strikePrice: data.get('strikePrice') || undefined,
                isActive: data.get('isActive') === 'on',
              },
              'PUT',
            );
            const refreshed = await loadVariants();
            setVariants(refreshed);
            setMessage(arabic ? 'تم تحديث المتغير.' : 'Variant updated.');
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'request-failed');
          }
        }}
      >
        <h3>{arabic ? 'تحديث متغير منتج' : 'Update Product Variant'}</h3>
        <label>
          {arabic ? 'معرّف المتغير' : 'Variant ID'}
          <select
            name="variantId"
            value={selectedVariantId ?? ''}
            onChange={(event) => setSelectedVariantId(Number(event.target.value))}
            required
          >
            <option value="" disabled>
              {arabic ? 'اختر متغيرًا' : 'Select a variant'}
            </option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.id} · {variant.sku}
              </option>
            ))}
          </select>
        </label>
        <label>
          SKU
          <input name="sku" defaultValue={selectedVariant?.sku} required />
        </label>
        <label>
          {arabic ? 'المفتاح' : 'Variant key'}
          <input name="variantKey" defaultValue={selectedVariant?.variantKey} required />
        </label>
        <label>
          {arabic ? 'الاسم بالإنجليزية' : 'English label'}
          <input name="labelEn" defaultValue={selectedVariant?.label.en} required />
        </label>
        <label>
          {arabic ? 'الاسم بالعربية' : 'Arabic label'}
          <input name="labelAr" defaultValue={selectedVariant?.label.ar} required />
        </label>
        <label>
          {arabic ? 'السعر بالجنيه' : 'Price (EGP)'}
          <input
            name="basePrice"
            defaultValue={selectedVariant?.basePrice}
            inputMode="decimal"
            required
          />
        </label>
        <label>
          {arabic ? 'السعر السابق (اختياري)' : 'Strike price (optional)'}
          <input
            name="strikePrice"
            defaultValue={selectedVariant?.strikePrice}
            inputMode="decimal"
          />
        </label>
        <label>
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={selectedVariant?.isActive ?? true}
          />
          {arabic ? ' نشط' : ' Active'}
        </label>
        <button type="submit">{arabic ? 'تحديث المتغير' : 'Update variant'}</button>
      </form>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          try {
            const result = await submit('/api/v1/back-office/inventory/adjustments', {
              variantId: Number(data.get('variantId')),
              warehouseId: Number(data.get('warehouseId')),
              quantityDelta: Number(data.get('quantityDelta')),
              notes: data.get('notes') || undefined,
            });
            setMessage(arabic ? 'تم تعديل المخزون.' : `Inventory ${result.status}.`);
            event.currentTarget.reset();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'request-failed');
          }
        }}
      >
        <h3>{arabic ? 'تعديل المخزون' : 'Adjust inventory'}</h3>
        <label>
          {arabic ? 'معرّف المتغير' : 'Variant ID'}
          <select
            name="variantId"
            value={
              activeVariants.some((variant) => variant.id === selectedVariantId)
                ? selectedVariantId
                : ''
            }
            onChange={(event) => setSelectedVariantId(Number(event.target.value))}
            required
          >
            <option value="" disabled>
              {arabic ? 'اختر متغيرًا' : 'Select a variant'}
            </option>
            {activeVariants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.id} · {variant.sku}
              </option>
            ))}
          </select>
        </label>
        <label>
          {arabic ? 'معرّف المستودع' : 'Warehouse ID'}
          <input name="warehouseId" type="number" min="1" required />
        </label>
        <label>
          {arabic ? 'الكمية (موجب أو سالب)' : 'Quantity change (+/-)'}
          <input name="quantityDelta" type="number" required />
        </label>
        <label>
          {arabic ? 'ملاحظة' : 'Note'}
          <input name="notes" />
        </label>
        <button type="submit">{arabic ? 'تعديل المخزون' : 'Adjust inventory'}</button>
      </form>
      {message && <p role="status">{message}</p>}
    </section>
  );
}

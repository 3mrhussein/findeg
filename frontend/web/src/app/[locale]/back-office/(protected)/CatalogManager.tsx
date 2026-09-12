'use client';

import { useState } from 'react';

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

export function CatalogManager({ locale }: { locale: 'en' | 'ar' }) {
  const [message, setMessage] = useState<string>();
  const arabic = locale === 'ar';
  return (
    <section className="catalog-manager">
      <h2>{arabic ? 'إدارة المخزون والمنتجات' : 'Catalog and inventory management'}</h2>
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
              isActive: true,
            });
            setMessage(
              arabic
                ? `تم إنشاء المتغير ${result.variantId}.`
                : `Variant ${result.variantId} created.`,
            );
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
        <button type="submit">{arabic ? 'إنشاء المتغير' : 'Create variant'}</button>
      </form>
      <form
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
                isActive: data.get('isActive') === 'on',
              },
              'PUT',
            );
            setMessage(arabic ? 'تم تحديث المتغير.' : 'Variant updated.');
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'request-failed');
          }
        }}
      >
        <h3>{arabic ? 'تحديث متغير منتج' : 'Update Product Variant'}</h3>
        <label>
          {arabic ? 'معرّف المتغير' : 'Variant ID'}
          <input name="variantId" type="number" min="1" required />
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
          <input name="isActive" type="checkbox" defaultChecked />
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
          <input name="variantId" type="number" min="1" required />
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

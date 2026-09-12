'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type {
  CartItem,
  CartQuote,
  CartResult,
  CheckoutInput,
  CheckoutQuote,
  CheckoutQuoteResult,
  CheckoutReceipt,
  CheckoutResult,
  DeliveryZone,
} from '@findeg/backend/modules/commerce/contracts';
import { CatalogBrowser } from './CatalogBrowser';
import { GuestOrderAccess } from './GuestOrderAccess';

const pendingStorageKey = 'findeg-pending-checkout';

async function request<Result>(path: string, method = 'GET', input?: unknown): Promise<Result> {
  const response = await fetch(`/api/v1/commerce/${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: input === undefined ? undefined : JSON.stringify(input),
    cache: 'no-store',
  });
  if (response.status >= 500) throw new Error('Request failed');
  return response.json();
}

export function StorefrontShopping({ locale }: { locale: 'en' | 'ar' }) {
  const ar = locale === 'ar';
  const text = (en: string, arabic: string) => (ar ? arabic : en);
  const [cart, setCart] = useState<CartQuote>();
  const [zones, setZones] = useState<readonly DeliveryZone[]>([]);
  const [quote, setQuote] = useState<CheckoutQuote>();
  const [pending, setPending] = useState<CheckoutInput>();
  const [receipt, setReceipt] = useState<CheckoutReceipt>();
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');

  function rejection(status: string) {
    const messages: Record<string, [string, string]> = {
      'invalid-input': [
        'Check the quantities and delivery details, including an Egyptian mobile number.',
        'تحقق من الكميات وبيانات التوصيل، بما فيها رقم محمول مصري.',
      ],
      'variant-unavailable': [
        'A product is no longer available. Clear your Cart and choose available products.',
        'أحد المنتجات لم يعد متاحًا. أفرغ السلة واختر منتجات متاحة.',
      ],
      'insufficient-stock': [
        'There is not enough stock. Reduce quantities or clear your Cart.',
        'المخزون غير كافٍ. قلل الكميات أو أفرغ السلة.',
      ],
      'empty-cart': ['Your Cart is empty.', 'سلة التسوق فارغة.'],
      'delivery-unavailable': [
        'This delivery zone is unavailable. Choose another zone.',
        'منطقة التوصيل غير متاحة. اختر منطقة أخرى.',
      ],
      'reconfirmation-required': [
        'Your Cart or prices changed. Review the updated total before confirming again.',
        'تغيرت السلة أو الأسعار. راجع الإجمالي الجديد قبل التأكيد مرة أخرى.',
      ],
      'idempotency-conflict': [
        'This request was already used with different details. Check your Order before placing another.',
        'استُخدم هذا الطلب ببيانات مختلفة. تحقق من طلبك قبل تقديم طلب آخر.',
      ],
    };
    const value = messages[status];
    return value ? value[ar ? 1 : 0] : text('Please try again.', 'حاول مرة أخرى.');
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const saved = sessionStorage.getItem(pendingStorageKey);
        if (saved) setPending(JSON.parse(saved));
        const [result, delivery] = await Promise.all([
          request<CartResult>('cart'),
          request<{ status: 'available'; zones: readonly DeliveryZone[] }>('delivery-zones'),
        ]);
        if (!active) return;
        if (result.status === 'quoted') setCart(result.quote);
        else setMessage(rejection(result.status));
        setZones(delivery.zones);
      } catch {
        if (active)
          setMessage(
            text(
              'Unable to load your Cart. Reload to try again.',
              'تعذر تحميل السلة. أعد تحميل الصفحة للمحاولة.',
            ),
          );
      } finally {
        if (active) setBusy(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [locale]);

  async function replaceCart(items: readonly CartItem[]) {
    setBusy(true);
    setQuote(undefined);
    setMessage('');
    try {
      const result = await request<CartResult>('cart', 'PUT', { items });
      if (result.status === 'quoted') setCart(result.quote);
      else setMessage(rejection(result.status));
    } catch {
      setMessage(
        text(
          'Cart update could not be confirmed. Reload before making more changes.',
          'تعذر تأكيد تحديث السلة. أعد تحميل الصفحة قبل إجراء تغييرات أخرى.',
        ),
      );
      setCart(undefined);
    } finally {
      setBusy(false);
    }
  }

  function add(variantId: number) {
    const items = cart?.items ?? [];
    const found = items.some((item) => item.variantId === variantId);
    void replaceCart(
      found
        ? items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity + (item.variantId === variantId ? 1 : 0),
          }))
        : [
            ...items.map(({ variantId, quantity }) => ({ variantId, quantity })),
            { variantId, quantity: 1 },
          ],
    );
  }

  async function accept(input: CheckoutInput) {
    setBusy(true);
    setMessage('');
    try {
      // Keep the exact request across a lost response or page reload; retry never invents a new key.
      sessionStorage.setItem(pendingStorageKey, JSON.stringify(input));
      setPending(input);
      const result = await request<CheckoutResult>('checkout', 'POST', input);
      if (result.status === 'accepted') {
        setReceipt(result);
        setCart({ items: [], subtotal: '0.00' });
      } else setMessage(rejection(result.status));
      sessionStorage.removeItem(pendingStorageKey);
      setPending(undefined);
      setQuote(undefined);
    } catch {
      setMessage(
        text(
          'The checkout outcome is uncertain. Retry the same request below to retrieve its outcome safely.',
          'نتيجة إتمام الطلب غير مؤكدة. أعد محاولة الطلب نفسه أدناه لاسترجاع نتيجته بأمان.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    if (quote) {
      await accept({
        key: crypto.randomUUID(),
        confirmation: quote.confirmation,
        paymentMethod: 'cash-on-delivery',
        deliveryMethod: 'home-delivery',
        address: {
          name: String(fields.get('name')),
          email: String(fields.get('email')),
          phone: String(fields.get('phone')),
          street: String(fields.get('street')),
          city: String(fields.get('city')),
          zoneId: Number(fields.get('zoneId')),
        },
      });
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const result = await request<CheckoutQuoteResult>('checkout/quote', 'POST', {
        zoneId: Number(fields.get('zoneId')),
      });
      if (result.status === 'quoted') {
        setQuote(result);
        setCart({ items: result.items, subtotal: result.subtotal });
      } else setMessage(rejection(result.status));
    } catch {
      setMessage(
        text(
          'Unable to get current prices. Try again.',
          'تعذر جلب الأسعار الحالية. حاول مرة أخرى.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="storefront-shopping">
      <CatalogBrowser locale={locale} disabled={busy || !!pending || !cart} onAdd={add} />
      <p role="status" aria-live="polite">
        {busy ? text('Please wait…', 'يرجى الانتظار…') : message}
      </p>
      <section aria-label={text('Your Cart', 'سلة التسوق')}>
        <h2>{text('Your Cart', 'سلة التسوق')}</h2>
        <p>
          {text(
            'Ordinary shopping is separate from School Supply Lists.',
            'التسوق العادي منفصل عن قوائم المستلزمات المدرسية.',
          )}
        </p>
        {cart?.items.length === 0 && <p>{text('Your Cart is empty.', 'سلة التسوق فارغة.')}</p>}
        <ul>
          {cart?.items.map((item) => (
            <li key={item.variantId}>
              <span>
                {item.name[locale] ?? item.sku} — {item.label[locale]} · {item.unitPrice} EGP
              </span>
              <label>
                {text('Quantity', 'الكمية')}
                <input
                  aria-label={`${text('Quantity', 'الكمية')} ${item.name[locale] ?? item.sku}`}
                  type="number"
                  min="1"
                  max="999"
                  value={item.quantity}
                  disabled={busy || !!pending}
                  onChange={(event) => {
                    const quantity = Number(event.target.value);
                    if (Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= 999)
                      void replaceCart(
                        cart.items.map((line) => ({
                          variantId: line.variantId,
                          quantity: line.variantId === item.variantId ? quantity : line.quantity,
                        })),
                      );
                  }}
                />
              </label>
              <span>{item.lineTotal} EGP</span>
              <button
                type="button"
                disabled={busy || !!pending}
                onClick={() =>
                  void replaceCart(
                    cart.items
                      .filter((line) => line.variantId !== item.variantId)
                      .map(({ variantId, quantity }) => ({ variantId, quantity })),
                  )
                }
              >
                {text('Remove', 'حذف')}
              </button>
            </li>
          ))}
        </ul>
        {cart && (
          <p>
            {text('Subtotal', 'المجموع الفرعي')}: {cart.subtotal} EGP
          </p>
        )}
        <button type="button" disabled={busy || !!pending} onClick={() => void replaceCart([])}>
          {text('Clear Cart', 'إفراغ السلة')}
        </button>
      </section>
      <section aria-label={text('Cash on Delivery', 'الدفع عند الاستلام')}>
        <h2>{text('Cash on Delivery', 'الدفع عند الاستلام')}</h2>
        <p>
          {text(
            'Home delivery. Pay after successful delivery.',
            'توصيل إلى المنزل. الدفع بعد التسليم بنجاح.',
          )}
        </p>
        {!zones.length && !busy && (
          <p>{text('No delivery zones are available yet.', 'لا توجد مناطق توصيل متاحة حاليًا.')}</p>
        )}
        <form onSubmit={checkout} onChange={() => setQuote(undefined)}>
          <fieldset disabled={busy || !!pending || !cart?.items.length || !zones.length}>
            <legend>{text('Delivery details', 'بيانات التوصيل')}</legend>
            <label>
              {text('Name', 'الاسم')}
              <input name="name" autoComplete="name" required maxLength={255} />
            </label>
            <label>
              {text('Email', 'البريد الإلكتروني')}
              <input name="email" type="email" autoComplete="email" required maxLength={255} />
            </label>
            <label>
              {text('Egyptian mobile number', 'رقم المحمول المصري')}
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="01012345678"
                pattern="(\+20|0)1[0125][0-9]{8}"
                required
              />
            </label>
            <label>
              {text('Street and building', 'الشارع والمبنى')}
              <input name="street" autoComplete="street-address" required maxLength={255} />
            </label>
            <label>
              {text('City', 'المدينة')}
              <input name="city" autoComplete="address-level2" required maxLength={255} />
            </label>
            <label>
              {text('Delivery zone', 'منطقة التوصيل')}
              <select name="zoneId" required defaultValue="">
                <option value="" disabled>
                  {text('Choose a zone', 'اختر منطقة')}
                </option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name[locale]} — {zone.fee} EGP
                  </option>
                ))}
              </select>
            </label>
            {quote && (
              <div role="status">
                <p>
                  {text('Delivery fee', 'رسوم التوصيل')}: {quote.zone.fee} EGP
                </p>
                <strong>
                  {text('Total to pay on delivery', 'الإجمالي عند الاستلام')}: {quote.total} EGP
                </strong>
                <p>
                  {text(
                    'Review your items and total before confirming.',
                    'راجع المنتجات والإجمالي قبل التأكيد.',
                  )}
                </p>
              </div>
            )}
            <button type="submit">
              {quote
                ? text('Confirm Order', 'تأكيد الطلب')
                : text('Review total', 'مراجعة الإجمالي')}
            </button>
          </fieldset>
        </form>
        {pending && (
          <button type="button" disabled={busy} onClick={() => void accept(pending)}>
            {text('Retry same checkout', 'إعادة محاولة الطلب نفسه')}
          </button>
        )}
        {receipt && (
          <div role="status">
            <h3>{text('Order accepted', 'تم قبول الطلب')}</h3>
            <p>
              {text('Order reference', 'مرجع الطلب')}: <code>{receipt.reference}</code>
            </p>
            <p>
              {text(
                'Guest access reference — save this to retrieve your Order',
                'مرجع وصول الضيف — احتفظ به لاسترجاع طلبك',
              )}
              : <code>{receipt.accessReference}</code>
            </p>
            <p>{receipt.total} EGP</p>
          </div>
        )}
      </section>
      <GuestOrderAccess locale={locale} reference={receipt?.accessReference} />
    </div>
  );
}

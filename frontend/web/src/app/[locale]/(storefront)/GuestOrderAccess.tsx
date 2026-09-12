'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { AcceptedOrder, GuestOrderResult } from '@findeg/backend/modules/commerce/contracts';

export function GuestOrderAccess({
  locale,
  reference,
}: {
  locale: 'en' | 'ar';
  reference?: string;
}) {
  const text = (en: string, ar: string) => (locale === 'ar' ? ar : en);
  const [accessReference, setAccessReference] = useState(reference ?? '');
  const [order, setOrder] = useState<AcceptedOrder>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (reference) setAccessReference(reference);
  }, [reference]);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setOrder(undefined);
    try {
      const response = await fetch('/api/v1/commerce/orders/access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reference: accessReference.trim(), code: fields.get('code') }),
      });
      if (response.status >= 500) throw new Error('Request failed');
      const result: GuestOrderResult = await response.json();
      if (result.status === 'verified') {
        setOrder(result.order);
        setMessage('');
      } else
        setMessage(
          text(
            'Verification failed. Check the reference and code; the code may be expired or already used.',
            'فشل التحقق. تحقق من المرجع والرمز؛ قد يكون الرمز منتهيًا أو مستخدمًا.',
          ),
        );
    } catch {
      setMessage(
        text('Unable to retrieve the Order. Try again.', 'تعذر استرجاع الطلب. حاول مرة أخرى.'),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label={text('Guest Order Access', 'الوصول إلى طلب الضيف')}>
      <h2>{text('Guest Order Access', 'الوصول إلى طلب الضيف')}</h2>
      <p>
        {text(
          'Enter your saved access reference and the one-time code received for this Order. Codes expire after 15 minutes.',
          'أدخل مرجع الوصول المحفوظ ورمز التحقق لمرة واحدة الذي تلقيته لهذا الطلب. تنتهي صلاحية الرمز بعد ١٥ دقيقة.',
        )}
      </p>
      <form onSubmit={verify}>
        <label>
          {text('Access reference', 'مرجع الوصول')}
          <input
            value={accessReference}
            onChange={(event) => setAccessReference(event.target.value)}
            required
            pattern="[a-f0-9]{32,128}"
          />
        </label>
        <label>
          {text('Verification code', 'رمز التحقق')}
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
        </label>
        <button disabled={busy}>{text('Retrieve Order', 'استرجاع الطلب')}</button>
      </form>
      <p role="status">{message}</p>
      {order && (
        <div role="status">
          <h3>{text('Your Order', 'طلبك')}</h3>
          <p>
            <code>{order.reference}</code>
          </p>
          <p>
            {text('Accepted · Cash on Delivery · Unpaid', 'مقبول · الدفع عند الاستلام · غير مدفوع')}
          </p>
          <ul>
            {order.items.map((item) => (
              <li key={item.attribution?.listItemId ?? item.variantId}>
                {item.name[locale] ?? item.sku} — {item.label[locale]} × {item.quantity} ·{' '}
                {item.lineTotal} EGP
              </li>
            ))}
          </ul>
          <p>
            {text('Total', 'الإجمالي')}: {order.total} EGP
          </p>
          <p>
            {order.address.name} · {order.address.street} · {order.address.city}
          </p>
        </div>
      )}
    </section>
  );
}

'use client';
import { useState } from 'react';
import type { OrderState } from '@findeg/backend/modules/commerce/contracts';

export function OrderLifecycle({
  locale,
  canDeliver,
  canPay,
}: {
  locale: 'en' | 'ar';
  canDeliver: boolean;
  canPay: boolean;
}) {
  const text = (en: string, ar: string) => (locale === 'ar' ? ar : en);
  const [reference, setReference] = useState('');
  const [state, setState] = useState<OrderState>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [keys, setKeys] = useState<{ delivery: string; payment: string }>();
  async function request(action?: 'deliver' | 'pay') {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(
        `/api/v1/back-office/orders/${reference}`,
        action
          ? {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                action,
                key: action === 'deliver' ? keys?.delivery : keys?.payment,
                ...(action === 'pay' ? { amount: state?.total } : {}),
              }),
            }
          : {},
      );
      const result = await response.json();
      if (!response.ok) {
        setMessage(
          text(
            'Operation could not be completed. Refresh the Order and check your access.',
            'تعذر إكمال العملية. حدّث الطلب وتحقق من صلاحياتك.',
          ),
        );
        return;
      }
      setState(result.state);
      if (!action) setKeys({ delivery: crypto.randomUUID(), payment: crypto.randomUUID() });
    } catch {
      setMessage(
        text(
          'Connection failed. Retry the same operation.',
          'فشل الاتصال. أعد محاولة العملية نفسها.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label={text('Order delivery and payment', 'تسليم الطلب والدفع')}>
      <h2>{text('Order delivery and payment', 'تسليم الطلب والدفع')}</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void request();
        }}
      >
        <label>
          {text('Order reference', 'مرجع الطلب')}
          <input
            name="orderReference"
            value={reference}
            onChange={(event) => {
              setReference(event.target.value);
              setState(undefined);
              setKeys(undefined);
            }}
            pattern="[a-f0-9]{64}"
            required
          />
        </label>
        <button disabled={busy}>{text('Load Order', 'عرض الطلب')}</button>
      </form>
      <p role="status">{message}</p>
      {state && (
        <div>
          <p>
            {text('Total', 'الإجمالي')}: {state.total} EGP
          </p>
          <p data-testid="order-lifecycle-status">
            {state.fulfillmentStatus === 'delivered'
              ? text('Delivered', 'تم التسليم')
              : text('Awaiting delivery', 'بانتظار التسليم')}{' '}
            · {state.paymentStatus === 'paid' ? text('Paid', 'مدفوع') : text('Unpaid', 'غير مدفوع')}
          </p>
          {canDeliver && (
            <button
              disabled={busy || state.fulfillmentStatus === 'delivered'}
              onClick={() => void request('deliver')}
            >
              {text('Confirm delivery', 'تأكيد التسليم')}
            </button>
          )}
          {canPay && (
            <button
              disabled={
                busy || state.fulfillmentStatus !== 'delivered' || state.paymentStatus === 'paid'
              }
              onClick={() => void request('pay')}
            >
              {text('Record cash received', 'تسجيل استلام النقد')}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input, Label } from '@findeg/ui';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@i18n/navigation';

/** Step two of Guest Order Access: the emailed 6-digit code opens that one Order. */
export function OrderCodeForm({ initialReference }: { initialReference: string }) {
  const t = useTranslations('Pages.GuestOrder');
  const router = useRouter();
  const [reference, setReference] = useState(initialReference);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFailed(false);
    try {
      const response = await fetch('/api/v1/guest-access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, code }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const { data } = await response.json();
      router.push(`/guest-orders/${encodeURIComponent(data.orderReference)}`);
    } catch {
      setFailed(true);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" data-testid="order-code-form">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('CodeTitle')}</h1>
        <p className="text-muted-foreground">{t('CodeIntro')}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="order-reference">{t('ReferenceLabel')}</Label>
        <Input
          id="order-reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          autoComplete="off"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="order-code">{t('CodeLabel')}</Label>
        <Input
          id="order-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
        />
      </div>
      {failed ? (
        <p role="alert" className="text-sm text-destructive">
          {t('CodeError')}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting || code.length !== 6} className="w-full">
        {t('OpenOrder')}
      </Button>
      <p className="text-sm text-muted-foreground">
        <Link href="/order-lookup" className="underline">
          {t('RequestAgain')}
        </Link>
      </p>
    </form>
  );
}

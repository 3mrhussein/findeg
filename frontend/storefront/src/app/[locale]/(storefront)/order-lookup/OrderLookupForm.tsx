'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input, Label } from '@findeg/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from '@i18n/navigation';

/**
 * Step one of Guest Order Access: reference + email. The server answers the same way whether or
 * not an Order matches, so this always moves on to the code-entry page.
 */
export function OrderLookupForm() {
  const t = useTranslations('Pages.GuestOrder');
  const router = useRouter();
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFailed(false);
    try {
      const response = await fetch('/api/v1/guest-access/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, email }),
      });
      if (!response.ok) throw new Error(String(response.status));
      router.push(`/order-lookup/code?reference=${encodeURIComponent(reference.trim())}`);
    } catch {
      setFailed(true);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" data-testid="order-lookup-form">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('LookupTitle')}</h1>
        <p className="text-muted-foreground">{t('LookupIntro')}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="order-reference">{t('ReferenceLabel')}</Label>
        <Input
          id="order-reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="FE-ABC123"
          autoComplete="off"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="order-email">{t('EmailLabel')}</Label>
        <Input
          id="order-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>
      {failed ? (
        <p role="alert" className="text-sm text-destructive">
          {t('LookupError')}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting} className="w-full">
        {t('SendCode')}
      </Button>
    </form>
  );
}

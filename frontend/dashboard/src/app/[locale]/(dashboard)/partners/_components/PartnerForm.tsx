'use client';

import { useActionState, useEffect } from 'react';
import { Button, Input, Label } from '@findeg/ui';
import { useRouter } from '@i18n/navigation';
import { savePartnerAction, type PartnerFormState } from '../_actions/partners';

interface PartnerFormProps {
  partner?: { id: number; code: string; nameEn: string; nameAr: string; status: string };
}

const initialState: PartnerFormState = { status: 'idle' };

/**
 * Create / edit form for a Business Partner. The code is read-only once the
 * partner has left onboarding.
 */
export function PartnerForm({ partner }: PartnerFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    savePartnerAction.bind(null, partner?.id ?? null),
    initialState,
  );
  const codeLocked = partner !== undefined && partner.status !== 'onboarding';

  useEffect(() => {
    if (state.status === 'saved') router.push('/partners');
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-xl space-y-4" data-testid="partner-form">
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          name="code"
          defaultValue={partner?.code}
          readOnly={codeLocked}
          required
          dir="ltr"
          placeholder="nile-school"
        />
        <p className="text-sm text-muted-foreground">
          Used in the Partner Workspace URL.{' '}
          {codeLocked
            ? 'Locked because this Business Partner is no longer onboarding.'
            : 'Can only be changed while onboarding.'}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="nameEn">Name (English)</Label>
        <Input id="nameEn" name="nameEn" defaultValue={partner?.nameEn} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nameAr">Name (Arabic)</Label>
        <Input id="nameAr" name="nameAr" defaultValue={partner?.nameAr} required dir="rtl" />
      </div>
      {state.status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {partner ? 'Save changes' : 'Create Business Partner'}
      </Button>
    </form>
  );
}

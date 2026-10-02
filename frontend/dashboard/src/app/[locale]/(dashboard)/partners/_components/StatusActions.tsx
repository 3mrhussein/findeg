'use client';

import { useState, useTransition } from 'react';
import { Button } from '@findeg/ui';
import { useLocale } from 'next-intl';
import { changePartnerStatusAction, type StatusActionState } from '../_actions/status';

export interface StatusActionOption {
  target: 'active' | 'suspended' | 'closed';
  label: string;
  /** Closing is permanent, so it asks for confirmation. */
  confirm?: string;
}

/** Status changes allowed from the Business Partner's current status. */
export function StatusActions({
  partnerId,
  options,
}: {
  partnerId: number;
  options: StatusActionOption[];
}) {
  const locale = useLocale();
  const [state, setState] = useState<StatusActionState>({ status: 'idle' });
  const [busy, startTransition] = useTransition();

  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">This Business Partner is closed.</p>;
  }

  return (
    <div className="space-y-2" data-testid="status-actions">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.target}
            type="button"
            variant={option.target === 'closed' ? 'destructive' : 'outline'}
            disabled={busy}
            onClick={() => {
              if (option.confirm && !window.confirm(option.confirm)) return;
              startTransition(async () =>
                setState(await changePartnerStatusAction(locale, partnerId, option.target)),
              );
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {state.status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
    </div>
  );
}

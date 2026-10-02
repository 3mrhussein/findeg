'use client';

import { useState, useTransition } from 'react';
import { Button } from '@findeg/ui';
import { useLocale } from 'next-intl';
import type { BusinessPartner } from '@findeg/backend/features/partner-membership';
import { changePartnerStatusAction, type StatusActionState } from '../_actions/status';

type Status = BusinessPartner['status'];

const CLOSE_CONFIRMATION =
  'Closing a Business Partner is permanent and cannot be undone. Continue?';

function labelFor(current: Status, target: Status): string {
  if (target === 'active') return current === 'suspended' ? 'Reactivate' : 'Activate';
  if (target === 'suspended') return 'Suspend';
  return 'Close';
}

/** Status changes the server allows from `current`; the page passes them in as `targets`. */
export function StatusActions({
  partnerId,
  current,
  targets,
}: {
  partnerId: number;
  current: Status;
  targets: readonly Status[];
}) {
  const locale = useLocale();
  const [state, setState] = useState<StatusActionState>({ status: 'idle' });
  const [busy, startTransition] = useTransition();

  if (targets.length === 0) {
    return <p className="text-sm text-muted-foreground">This Business Partner is closed.</p>;
  }

  return (
    <div className="space-y-2" data-testid="status-actions">
      <div className="flex flex-wrap gap-2">
        {targets.map((target) => (
          <Button
            key={target}
            type="button"
            variant={target === 'closed' ? 'destructive' : 'outline'}
            disabled={busy}
            onClick={() => {
              if (target === 'closed' && !window.confirm(CLOSE_CONFIRMATION)) return;
              startTransition(async () =>
                setState(await changePartnerStatusAction(locale, partnerId, target)),
              );
            }}
          >
            {labelFor(current, target)}
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

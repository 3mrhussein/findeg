'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@findeg/ui';
import type { ActionState } from './_lib/action-state';
import { leaveAction } from './actions';

/** Lets any member end their own membership. */
export function LeaveButton({ code }: { code: string }) {
  const t = useTranslations('PartnerWorkspace');
  const [state, setState] = useState<ActionState>({ status: 'idle' });
  const [busy, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => {
          if (confirm(t('LeaveConfirm'))) {
            startTransition(async () => setState(await leaveAction(code)));
          }
        }}
      >
        {t('Leave')}
      </Button>
      {state.status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
    </div>
  );
}

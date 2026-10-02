'use client';

import { useState, useTransition } from 'react';
import { Button } from '@findeg/ui';
import type { ActionState } from './_lib/action-state';
import { leaveAction } from './actions';

/** Lets any member end their own membership. */
export function LeaveButton({ code }: { code: string }) {
  const [state, setState] = useState<ActionState>({ status: 'idle' });
  const [busy, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => {
          if (confirm('Leave this Business Partner? You will lose access to its workspace.')) {
            startTransition(async () => setState(await leaveAction(code)));
          }
        }}
      >
        Leave
      </Button>
      {state.status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
    </div>
  );
}

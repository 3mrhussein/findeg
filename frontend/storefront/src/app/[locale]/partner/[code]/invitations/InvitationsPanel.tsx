'use client';

import { useActionState, useState, useTransition } from 'react';
import type { PartnerRole } from '@findeg/backend/features/partner-membership';
import { Button, Input, Label } from '@findeg/ui';
import type { ActionState } from '../_lib/action-state';
import { PARTNER_ROLES, ROLE_LABELS } from '../_lib/roles';
import { inviteAction, resendInvitationAction, revokeInvitationAction } from './actions';

export interface PendingInvitation {
  id: number;
  email: string;
  roles: PartnerRole[];
  expiresAt: string;
}

const idle: ActionState = { status: 'idle' };

// Until the Outbox delivers invitation emails, Partner Administrators share the link themselves.
function LinkBox({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2" data-testid="invitation-link">
      <Input readOnly value={link} dir="ltr" onFocus={(event) => event.currentTarget.select()} />
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setCopied(true);
        }}
      >
        {copied ? 'Copied' : 'Copy link'}
      </Button>
    </div>
  );
}

/** Pending invitations of one Business Partner, with invite, resend, revoke and copy link. */
export function InvitationsPanel({
  locale,
  code,
  invitations,
}: {
  locale: string;
  code: string;
  invitations: PendingInvitation[];
}) {
  const [inviteState, inviteFormAction, inviting] = useActionState(
    inviteAction.bind(null, locale, code),
    idle,
  );
  const [rowState, setRowState] = useState<{ id: number; state: ActionState }>();
  const [busy, startTransition] = useTransition();

  const run = (id: number, action: () => Promise<ActionState>) =>
    startTransition(async () => setRowState({ id, state: await action() }));

  return (
    <div className="space-y-6">
      <form action={inviteFormAction} className="max-w-xl space-y-4" data-testid="invite-form">
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input id="invite-email" name="email" type="email" required dir="ltr" />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Roles</legend>
          {PARTNER_ROLES.map((role) => (
            <label key={role} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="roles" value={role} />
              {ROLE_LABELS[role]}
            </label>
          ))}
        </fieldset>
        {inviteState.status === 'error' && (
          <p role="alert" className="text-sm text-red-600">
            {inviteState.message}
          </p>
        )}
        <Button type="submit" disabled={inviting}>
          Invite
        </Button>
        {inviteState.link && <LinkBox link={inviteState.link} />}
      </form>

      <div>
        <h2 className="mb-2 text-xl font-semibold">Pending invitations</h2>
        <ul className="divide-y rounded-lg border" data-testid="pending-invitations">
          {invitations.map((invitation) => (
            <li key={invitation.id} className="space-y-2 p-4" data-testid="pending-invitation">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div dir="ltr" className="font-medium">
                    {invitation.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {invitation.roles.map((role) => ROLE_LABELS[role]).join(', ')} · expires{' '}
                    {new Date(invitation.expiresAt).toLocaleDateString('en-GB', {
                      timeZone: 'UTC',
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      run(invitation.id, () => resendInvitationAction(locale, code, invitation.id))
                    }
                  >
                    Resend &amp; copy link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      run(invitation.id, () => revokeInvitationAction(code, invitation.id))
                    }
                  >
                    Revoke
                  </Button>
                </div>
              </div>
              {rowState?.id === invitation.id && rowState.state.status === 'error' && (
                <p role="alert" className="text-sm text-red-600">
                  {rowState.state.message}
                </p>
              )}
              {rowState?.id === invitation.id && rowState.state.link && (
                <LinkBox link={rowState.state.link} />
              )}
            </li>
          ))}
          {invitations.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">No pending invitations.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

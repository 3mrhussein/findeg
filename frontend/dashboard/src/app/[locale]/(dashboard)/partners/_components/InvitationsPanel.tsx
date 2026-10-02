'use client';

import { useActionState, useState, useTransition } from 'react';
import { Button, Input, Label } from '@findeg/ui';
import { useLocale } from 'next-intl';
import {
  inviteAction,
  resendInvitationAction,
  revokeInvitationAction,
  type InvitationActionState,
} from '../_actions/invitations';
import { PARTNER_ROLES } from '../_lib/partnerRoles';

export interface PendingInvitation {
  id: number;
  email: string;
  roles: string[];
  expiresAt: string;
}

interface InvitationsPanelProps {
  partnerId: number;
  /** False while the Business Partner is suspended or closed. */
  canChange: boolean;
  invitations: PendingInvitation[];
}

const idle: InvitationActionState = { status: 'idle' };

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

/** Pending Partner Invitations of one Business Partner, with invite, resend, revoke and copy link. */
export function InvitationsPanel({ partnerId, canChange, invitations }: InvitationsPanelProps) {
  const locale = useLocale();
  const [inviteState, inviteFormAction, inviting] = useActionState(
    inviteAction.bind(null, locale, partnerId),
    idle,
  );
  const [rowState, setRowState] = useState<{ id: number; state: InvitationActionState }>();
  const [busy, startTransition] = useTransition();

  const run = (id: number, action: () => Promise<InvitationActionState>) =>
    startTransition(async () => setRowState({ id, state: await action() }));

  return (
    <div className="space-y-6">
      {canChange ? (
        <form action={inviteFormAction} className="max-w-xl space-y-4" data-testid="invite-form">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" name="email" type="email" required dir="ltr" />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Roles</legend>
            {PARTNER_ROLES.map((role) => (
              <label key={role.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="roles"
                  value={role.value}
                  defaultChecked={role.value === 'partner-administrator'}
                />
                {role.label}
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
      ) : (
        <p className="text-sm text-muted-foreground">
          Invitations can only change while the Business Partner is onboarding or active.
        </p>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Pending invitations</h2>
        <ul className="divide-y rounded-lg border" data-testid="pending-invitations">
          {invitations.map((invitation) => (
            <li key={invitation.id} className="space-y-2 p-4" data-testid="pending-invitation">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div dir="ltr" className="font-medium">
                    {invitation.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {invitation.roles.join(', ')} · expires{' '}
                    {new Date(invitation.expiresAt).toLocaleDateString('en-GB')}
                  </div>
                </div>
                {canChange && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        run(invitation.id, () => resendInvitationAction(locale, invitation.id))
                      }
                    >
                      Resend &amp; copy link
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        run(invitation.id, () => revokeInvitationAction(locale, invitation.id))
                      }
                    >
                      Revoke
                    </Button>
                  </div>
                )}
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

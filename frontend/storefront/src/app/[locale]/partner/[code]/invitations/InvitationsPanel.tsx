'use client';

import { useActionState, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { PartnerInvitation } from '@findeg/backend/features/partner-membership';
import { Button, Input, Label } from '@findeg/ui';
import { BUSINESS_TIME_ZONE } from '@findeg/domain';
import type { ActionState } from '../_lib/action-state';
import { PARTNER_ROLES } from '../_lib/roles';
import { inviteAction, resendInvitationAction, revokeInvitationAction } from './actions';

/** The service's invitation as the page passes it across the client boundary (dates as ISO strings). */
export type PendingInvitation = Pick<PartnerInvitation, 'id' | 'email' | 'roles'> & {
  expiresAt: string;
};

const idle: ActionState = { status: 'idle' };

// Until the Outbox delivers invitation emails, Partner Administrators share the link themselves.
function LinkBox({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('PartnerWorkspace');
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
        {copied ? t('Copied') : t('CopyLink')}
      </Button>
    </div>
  );
}

/** Pending invitations of one Business Partner, with invite, resend, revoke and copy invitation link. */
export function InvitationsPanel({
  locale,
  code,
  canChange,
  invitations,
}: {
  locale: string;
  code: string;
  /** False while the Business Partner is suspended: the list stays readable, changes are refused. */
  canChange: boolean;
  invitations: PendingInvitation[];
}) {
  const t = useTranslations('PartnerWorkspace');
  const [inviteState, inviteFormAction, inviting] = useActionState(
    inviteAction.bind(null, locale, code),
    idle,
  );
  const [rowState, setRowState] = useState<{ id: number; state: ActionState }>();
  const [busy, startTransition] = useTransition();
  // The service requires at least one role; the form mirrors that so the round trip is avoided.
  const [hasRole, setHasRole] = useState(false);

  const run = (id: number, action: () => Promise<ActionState>) =>
    startTransition(async () => setRowState({ id, state: await action() }));

  return (
    <div className="space-y-6">
      {canChange ? (
        <form
          action={inviteFormAction}
          onReset={() => setHasRole(false)}
          className="max-w-xl space-y-4"
          data-testid="invite-form"
        >
          <div className="space-y-2">
            <Label htmlFor="invite-email">{t('Email')}</Label>
            <Input id="invite-email" name="email" type="email" required dir="ltr" />
          </div>
          <fieldset
            className="space-y-2"
            onChange={(event) =>
              setHasRole(event.currentTarget.querySelector('input:checked') !== null)
            }
          >
            <legend className="text-sm font-medium">{t('RolesLabel')}</legend>
            {PARTNER_ROLES.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="roles" value={role} />
                {t(`Roles.${role}`)}
              </label>
            ))}
          </fieldset>
          {inviteState.status === 'error' && (
            <p role="alert" className="text-sm text-red-600">
              {inviteState.message}
            </p>
          )}
          <Button type="submit" disabled={inviting || !hasRole}>
            {t('Invite')}
          </Button>
          {inviteState.link && <LinkBox link={inviteState.link} />}
        </form>
      ) : (
        <p className="text-sm text-muted-foreground" data-testid="invitations-read-only">
          {t('InvitationsSuspendedHint')}
        </p>
      )}

      <div>
        <h2 className="mb-2 text-xl font-semibold">{t('PendingInvitations')}</h2>
        <ul className="divide-y rounded-lg border" data-testid="pending-invitations">
          {invitations.map((invitation) => (
            <li key={invitation.id} className="space-y-2 p-4" data-testid="pending-invitation">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div dir="ltr" className="font-medium">
                    {invitation.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {invitation.roles.map((role) => t(`Roles.${role}`)).join(', ')} ·{' '}
                    {t('Expires', {
                      date: new Date(invitation.expiresAt).toLocaleDateString(
                        locale === 'ar' ? 'ar-EG' : 'en-GB',
                        { timeZone: BUSINESS_TIME_ZONE },
                      ),
                    })}
                  </div>
                </div>
                {canChange && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        run(invitation.id, () =>
                          resendInvitationAction(locale, code, invitation.id),
                        )
                      }
                    >
                      {t('ResendAndCopy')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        run(invitation.id, () => revokeInvitationAction(code, invitation.id))
                      }
                    >
                      {t('Revoke')}
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
            <li className="p-4 text-sm text-muted-foreground">{t('NoPendingInvitations')}</li>
          )}
        </ul>
      </div>
    </div>
  );
}

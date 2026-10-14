'use client';
import { useActionError } from '@hooks/use-action-error';
import type { Locale } from '@findeg/domain';

import { useActionState, useState, useTransition } from 'react';
import { Badge, Button, Input, Label } from '@findeg/ui';
import { useLocale, useTranslations } from 'next-intl';
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
  const t = useTranslations('Partners');
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
        {copied ? t('Copied') : t('CopyLink')}
      </Button>
    </div>
  );
}

/** Pending Partner Invitations of one Business Partner, with invite, resend, revoke and copy link. */
export function InvitationsPanel({ partnerId, canChange, invitations }: InvitationsPanelProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations('Partners');
  const actionError = useActionError('Partners.InvitationErrors');
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
            <Label htmlFor="invite-email">{t('Email')}</Label>
            <Input id="invite-email" name="email" type="email" required dir="ltr" />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{t('Roles')}</legend>
            {PARTNER_ROLES.map((role) => (
              <label key={role.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="roles"
                  value={role.value}
                  defaultChecked={role.value === 'partner-administrator'}
                />
                {t(`RoleLabels.${role.value}`)}
              </label>
            ))}
          </fieldset>
          {inviteState.status === 'error' && (
            <p role="alert" className="text-sm text-red-600">
              {actionError(inviteState.message)}
            </p>
          )}
          <Button type="submit" disabled={inviting}>
            {t('Invite')}
          </Button>
          {inviteState.link && <LinkBox link={inviteState.link} />}
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">{t('InvitationsOpenOnly')}</p>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">{t('PendingInvitations')}</h2>
        <ul className="divide-y rounded-lg border" data-testid="pending-invitations">
          {invitations.map((invitation) => {
            const isExpired = new Date(invitation.expiresAt).getTime() <= Date.now();
            const dateLocale = locale === 'ar' ? 'ar-EG' : 'en-GB';
            const formattedDate = new Date(invitation.expiresAt).toLocaleDateString(dateLocale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <li key={invitation.id} className="space-y-2 p-4" data-testid="pending-invitation">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div dir="ltr" className="font-medium">
                      {invitation.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {invitation.roles
                          .map((role) =>
                            t.has(`RoleLabels.${role}`) ? t(`RoleLabels.${role}`) : role,
                          )
                          .join(', ')}
                      </span>
                      <span>·</span>
                      {isExpired ? (
                        <Badge variant="destructive" data-testid="invitation-expired-badge">
                          {t('Expired', { date: formattedDate })}
                        </Badge>
                      ) : (
                        <span data-testid="invitation-expiry">
                          {t('Expires', { date: formattedDate })}
                        </span>
                      )}
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
                        {t('Resend')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          run(invitation.id, () => revokeInvitationAction(locale, invitation.id))
                        }
                      >
                        {t('Revoke')}
                      </Button>
                    </div>
                  )}
                </div>
                {rowState?.id === invitation.id && rowState.state.status === 'error' && (
                  <p role="alert" className="text-sm text-red-600">
                    {actionError(rowState.state.message)}
                  </p>
                )}
                {rowState?.id === invitation.id && rowState.state.link && (
                  <LinkBox link={rowState.state.link} />
                )}
              </li>
            );
          })}
          {invitations.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">{t('NoInvitations')}</li>
          )}
        </ul>
      </div>
    </div>
  );
}

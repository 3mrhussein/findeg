'use client';

import { useState, useTransition } from 'react';
import { Badge, Button } from '@findeg/ui';
import { useLocale } from 'next-intl';
import type { Locale } from 'next-intl';
import { updateMembershipAction, type MembershipActionState } from '../_actions/memberships';

import { PARTNER_ROLES, type PartnerRoleValue as RoleValue } from '../_lib/partnerRoles';

export interface MemberRow {
  id: number;
  email: string;
  name: string;
  roles: RoleValue[];
  status: 'active' | 'suspended' | 'ended';
  authorizationVersion: number;
}

interface MembersPanelProps {
  /** False while the Business Partner is suspended or closed. */
  canChange: boolean;
  members: MemberRow[];
}

/** Members of one Business Partner, with change roles, suspend, reactivate and end. */
export function MembersPanel({ canChange, members }: MembersPanelProps) {
  const locale = useLocale() as Locale;
  const [editing, setEditing] = useState<{ id: number; roles: RoleValue[] }>();
  const [rowState, setRowState] = useState<{ id: number; state: MembershipActionState }>();
  const [busy, startTransition] = useTransition();

  const run = (member: MemberRow, input: Parameters<typeof updateMembershipAction>[3]) =>
    startTransition(async () => {
      const state = await updateMembershipAction(
        locale,
        member.id,
        member.authorizationVersion,
        input,
      );
      setRowState({ id: member.id, state });
      if (state.status === 'done') setEditing(undefined);
    });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Members</h2>
      {!canChange && (
        <p className="mb-2 text-sm text-muted-foreground">
          Memberships can only change while the Business Partner is onboarding or active.
        </p>
      )}
      <ul className="divide-y rounded-lg border" data-testid="members">
        {members.map((member) => (
          <li key={member.id} className="space-y-2 p-4" data-testid="member">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div dir="ltr" className="font-medium">
                  {member.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {member.name && <span>{member.name} ·</span>}
                  <span>{member.roles.join(', ')}</span>
                  <Badge variant="outline">{member.status}</Badge>
                </div>
              </div>
              {canChange && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setEditing({ id: member.id, roles: member.roles })}
                  >
                    Change roles
                  </Button>
                  {member.status === 'active' ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() => run(member, { status: 'suspended' })}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy}
                      onClick={() => run(member, { status: 'active' })}
                    >
                      Reactivate
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`End ${member.email}'s membership? This is permanent.`)) {
                        run(member, { status: 'ended' });
                      }
                    }}
                  >
                    End
                  </Button>
                </div>
              )}
            </div>
            {editing?.id === member.id && (
              <div className="space-y-2" data-testid="roles-editor">
                {PARTNER_ROLES.map((role) => (
                  <label key={role.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editing.roles.includes(role.value)}
                      onChange={(event) =>
                        setEditing({
                          id: member.id,
                          roles: event.target.checked
                            ? [...editing.roles, role.value]
                            : editing.roles.filter((value) => value !== role.value),
                        })
                      }
                    />
                    {role.label}
                  </label>
                ))}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() => run(member, { roles: editing.roles })}
                  >
                    Save roles
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(undefined)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {rowState?.id === member.id && rowState.state.status === 'error' && (
              <p role="alert" className="text-sm text-red-600">
                {rowState.state.message}
              </p>
            )}
          </li>
        ))}
        {members.length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">No members yet.</li>
        )}
      </ul>
    </div>
  );
}

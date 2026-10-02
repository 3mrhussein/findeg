'use client';

import { useState, useTransition } from 'react';
import { Button } from '@findeg/ui';
import type { PartnerRole } from '@findeg/backend/features/partner-membership';
import { PARTNER_ROLES, roleLabel, type ActionState } from '../_lib/roles';
import { updateMemberAction } from './actions';

export interface MemberRow {
  id: number;
  email: string;
  name: string;
  roles: PartnerRole[];
  status: 'active' | 'suspended';
  authorizationVersion: number;
  isSelf: boolean;
}

function MemberItem({
  code,
  member,
  canChange,
}: {
  code: string;
  member: MemberRow;
  canChange: boolean;
}) {
  const [roles, setRoles] = useState<PartnerRole[]>(member.roles);
  const [state, setState] = useState<ActionState>({ status: 'idle' });
  const [busy, startTransition] = useTransition();

  const run = (input: Parameters<typeof updateMemberAction>[3]) =>
    startTransition(async () =>
      setState(await updateMemberAction(code, member.id, member.authorizationVersion, input)),
    );
  const toggle = (role: PartnerRole) =>
    setRoles((current) =>
      current.includes(role) ? current.filter((value) => value !== role) : [...current, role],
    );
  const rolesChanged =
    roles.length !== member.roles.length || roles.some((role) => !member.roles.includes(role));

  return (
    <li className="space-y-3 p-4" data-testid="member">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-medium">
            {member.name || member.email}
            {member.isSelf ? ' (you)' : ''}
          </div>
          <div dir="ltr" className="text-sm text-muted-foreground">
            {member.email}
          </div>
        </div>
        <span className="text-sm" data-testid="member-status">
          {member.status === 'active' ? 'Active' : 'Suspended'}
        </span>
      </div>

      {canChange ? (
        <>
          <fieldset className="flex flex-wrap gap-x-4 gap-y-2" disabled={busy}>
            <legend className="sr-only">Roles of {member.email}</legend>
            {PARTNER_ROLES.map((role) => (
              <label key={role.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={roles.includes(role.value)}
                  onChange={() => toggle(role.value)}
                />
                {role.label}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={busy || !rolesChanged} onClick={() => run({ roles })}>
              Save roles
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => run({ status: member.status === 'active' ? 'suspended' : 'active' })}
            >
              {member.status === 'active' ? 'Suspend' : 'Reactivate'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                if (confirm(`Remove ${member.email} from this Business Partner?`)) {
                  run({ status: 'ended' });
                }
              }}
            >
              Remove
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{member.roles.map(roleLabel).join(', ')}</p>
      )}

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
    </li>
  );
}

/** Current members of a Business Partner with role, suspend, reactivate and remove actions. */
export function MembersList({
  code,
  canChange,
  members,
}: {
  code: string;
  /** False while the Business Partner is suspended or closed. */
  canChange: boolean;
  members: MemberRow[];
}) {
  return (
    <div className="space-y-4">
      {!canChange && (
        <p className="text-sm text-muted-foreground">
          Members can only change while the Business Partner is onboarding or active.
        </p>
      )}
      <ul className="divide-y rounded-lg border" data-testid="members">
        {members.map((member) => (
          <MemberItem key={member.id} code={code} member={member} canChange={canChange} />
        ))}
      </ul>
    </div>
  );
}

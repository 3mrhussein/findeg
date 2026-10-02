'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@findeg/ui';
import type {
  PartnerMember,
  PartnerRole,
  UpdateMembershipInput,
} from '@findeg/backend/features/partner-membership';
import type { ActionState } from '../_lib/action-state';
import { PARTNER_ROLES, ROLE_LABELS } from '../_lib/roles';
import { updateMemberAction } from './actions';

export interface MemberRow {
  id: number;
  email: string;
  name: string;
  roles: PartnerRole[];
  status: Exclude<PartnerMember['status'], 'ended'>;
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
  const router = useRouter();
  const [roles, setRoles] = useState<PartnerRole[]>(member.roles);
  const [state, setState] = useState<ActionState>({ status: 'idle' });
  const [busy, startTransition] = useTransition();

  const save = (input: UpdateMembershipInput) =>
    startTransition(async () => {
      const result = await updateMemberAction(code, member.id, member.authorizationVersion, input);
      setState(result);
      // A stale edit keeps failing until the row has the current version, so reload it.
      if (result.status === 'error' && result.stale) router.refresh();
    });
  const toggle = (role: PartnerRole) =>
    setRoles((current) =>
      current.includes(role) ? current.filter((value) => value !== role) : [...current, role],
    );
  const rolesChanged =
    roles.length !== member.roles.length || roles.some((role) => !member.roles.includes(role));

  return (
    <li className="space-y-3 py-4" data-testid="member">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-medium text-foreground">
            {member.name || member.email}
            {member.isSelf ? ' (you)' : ''}
          </div>
          <div dir="ltr" className="text-sm">
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
              <label key={role} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggle(role)}
                />
                {ROLE_LABELS[role]}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={busy || !rolesChanged} onClick={() => save({ roles })}>
              Save roles
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => save({ status: member.status === 'active' ? 'suspended' : 'active' })}
            >
              {member.status === 'active' ? 'Suspend' : 'Reactivate'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                if (confirm(`Remove ${member.email} from this Business Partner?`)) {
                  save({ status: 'ended' });
                }
              }}
            >
              Remove
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm">{member.roles.map((role) => ROLE_LABELS[role]).join(', ')}</p>
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
        <p className="text-sm">
          Members can only change while the Business Partner is onboarding or active.
        </p>
      )}
      <ul className="divide-y" data-testid="members">
        {members.map((member) => (
          <MemberItem key={member.id} code={code} member={member} canChange={canChange} />
        ))}
      </ul>
    </div>
  );
}

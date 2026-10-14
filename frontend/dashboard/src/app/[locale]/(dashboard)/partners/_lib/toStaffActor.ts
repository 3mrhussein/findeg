import type { SessionPayload } from '@findeg/identity/types';
import type { StaffActor } from '@findeg/partners';

export function toStaffActor(session: SessionPayload): StaffActor {
  return {
    kind: 'staff',
    userId: session.userId,
    permissionCodes: session.permissionCodes,
    activeRoleIds: session.activeRoleIds,
  };
}

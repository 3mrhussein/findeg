import type { SessionPayload } from '@findeg/backend/features/core';
import type { StaffActor } from '@findeg/backend/features/partner-membership';

export function toStaffActor(session: SessionPayload): StaffActor {
  return {
    kind: 'staff',
    userId: session.userId,
    permissionCodes: session.permissionCodes,
    activeRoleIds: session.activeRoleIds,
  };
}

import type { SessionPayload } from '@findeg/backend/features/core';
import type { SupplyListStaffActor } from '@findeg/school-lists';

export function toListActor(session: SessionPayload): SupplyListStaffActor {
  return {
    kind: 'staff',
    userId: session.userId,
    permissionCodes: session.permissionCodes,
    activeRoleIds: session.activeRoleIds,
  };
}

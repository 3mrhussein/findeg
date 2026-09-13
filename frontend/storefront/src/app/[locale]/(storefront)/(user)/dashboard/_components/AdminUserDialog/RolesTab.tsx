'use client';

import { Checkbox } from '@findeg/ui';
import { ScrollArea } from '@findeg/ui';
import type { Role } from './AdminUserDialog.interface';

interface RolesTabProps {
  roles: Role[];
  selectedRoleIds: number[];
  onToggle: (roleId: number) => void;
}

/**
 * Roles tab — scrollable checklist of available admin roles.
 */
export function RolesTab({ roles, selectedRoleIds, onToggle }: RolesTabProps) {
  return (
    <ScrollArea className="h-64 pr-3">
      <div className="space-y-2">
        {roles.map((role) => (
          <label
            key={role.id}
            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/40 transition-colors"
          >
            <Checkbox
              checked={selectedRoleIds.includes(role.id)}
              onCheckedChange={() => onToggle(role.id)}
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{role.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{role.code}</p>
            </div>
          </label>
        ))}
      </div>
    </ScrollArea>
  );
}

/**
 * AdminUserDialog — shared types & interfaces
 */

export interface Role {
  id: number;
  code: string;
  name: string;
}

export interface Permission {
  id: number;
  code: string;
  name: string;
}

export interface AdminUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  roles: Role[];
  permissionOverrides: { permissionCode: string; action: 'grant' | 'revoke' }[];
}

export interface AdminUserDialogProps {
  open: boolean;
  user: AdminUser | null;
  defaultTab?: 'profile' | 'roles' | 'overrides';
  onClose: (refreshed?: boolean) => void;
}

export type OverrideAction = 'default' | 'grant' | 'revoke';

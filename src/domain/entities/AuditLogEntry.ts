/**
 * Domain Entity: AuditLogEntry
 *
 * Records an admin action for accountability and debugging.
 * Stores before/after snapshots of the affected entity.
 */

export interface AuditLogEntry {
  id: number;
  /** Admin user who performed the action */
  adminUserId?: number;
  /** Admin user name (resolved for display) */
  adminUserName?: string;
  /** Entity type affected (e.g., "product", "order", "category") */
  entityType: string;
  /** ID of the affected entity */
  entityId: string;
  /** Action performed: "create", "update", "delete" */
  action: string;
  /** Data before the change (null for create actions) */
  oldValues?: Record<string, unknown>;
  /** Data after the change (null for delete actions) */
  newValues?: Record<string, unknown>;
  createdAt: Date;
}

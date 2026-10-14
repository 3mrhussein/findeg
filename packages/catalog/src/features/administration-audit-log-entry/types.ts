/**
 * Domain Entity: AuditLogEntry
 *
 * Records an admin action for accountability and debugging.
 */
export interface AuditLogEntry {
  /** Unique ID for the audit log record */
  id: number;
  /** ID of the admin user who performed the action */
  adminUserId?: number;
  /** Resolved name of the admin user (denormalized for display) */
  adminUserName?: string;
  /** The type of entity affected (e.g., 'Product', 'Category') */
  entityType: string;
  /** The specific ID of the affected entity */
  entityId: string;
  /** The action performed (e.g., 'CREATE', 'UPDATE', 'DELETE') */
  action: string;
  /** Snapshot of data before the change */
  oldValues?: Record<string, unknown>;
  /** Snapshot of data after the change */
  newValues?: Record<string, unknown>;
  /** Timestamp of the event */
  createdAt: Date;
}

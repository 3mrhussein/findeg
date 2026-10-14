import {
  PERMISSION_CODES,
  staffRole,
  customerRole,
  systemAdmin,
  adminSession,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@findeg/db/types';

/**
 * Global registry of permission strings used throughout the application.
 * Re-exported from @findeg/db for compatibility.
 */
export { PERMISSION_CODES };

/**
 * Predicates re-exported from @findeg/db.
 */
export {
  staffRole,
  customerRole,
  systemAdmin,
  adminSession,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
};

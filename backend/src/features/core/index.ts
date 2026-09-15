/** Public core contracts and shared helpers. Concrete providers and errors stay internal. */
export type { AuthResult } from './domain/auth/AuthResult';
export type { SessionPayload } from './domain/auth/SessionPayload';
export {
  PERMISSION_CODES,
  systemAdmin,
  staffRole,
  schoolRole,
  customerRole,
  adminSession,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from './domain/auth/authorization';
export { createUserVO, type UserVO } from './domain/value-objects/User';
export {
  TranslationMapSchema,
  parse,
  type Locale,
  type TranslationMap,
} from './domain/value-objects/Locale';
export type { PermissionCode } from './domain/value-objects/Identity';
export type { PortalRole, OrderStatus, PaymentStatus } from './domain/types/common';
export type { Notification } from './domain/types/Notification';
export type { DomainError } from './domain/errors/DomainError';
export type { ILoggerService, LogMetadata, LogLevel } from './application/interfaces/ILoggerService';
export type { ISessionManager } from './application/interfaces/ISessionManager';
export type { ISessionProvider } from './application/interfaces/ISessionProvider';
export type { IStorageProvider } from './application/interfaces/IStorageProvider';
export type { ICacheInvalidator } from './application/interfaces/ICacheInvalidator';
export type { ICurrentSessionCodec } from './application/interfaces/ICurrentSessionCodec';
export type {
  ServiceResult,
  ExtractServiceResultData,
} from './application/types/ServiceResult';
export type {
  ICookieStore,
  CurrentSessionIdentity,
  ICurrentSessionIdentityResolver,
} from './application/services/CurrentSessionProvider';
export { createCookieSessionProvider } from './application/services/factory';

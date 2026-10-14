/** Core infrastructure exports. Identity-owned contracts are published by @findeg/identity. */
export type { SessionPayload } from './domain/auth/SessionPayload';
export {
  DEFAULT_LOCALE,
  TranslationMapSchema,
  parse,
  type Locale,
  type TranslationMap,
} from './domain/value-objects/Locale';
export { PortalRoleSchema } from './domain/types/common';
export type { PortalRole, OrderStatus, PaymentStatus } from './domain/types/common';
export type { Notification } from './domain/types/Notification';
export type {
  ILoggerService,
  LogMetadata,
  LogLevel,
} from './application/interfaces/ILoggerService';
export type { ISessionManager } from './application/interfaces/ISessionManager';
export type { ISessionProvider } from './application/interfaces/ISessionProvider';
export type { IStorageProvider } from './application/interfaces/IStorageProvider';
export type { ICacheInvalidator } from './application/interfaces/ICacheInvalidator';
export type { ICurrentSessionCodec } from './application/interfaces/ICurrentSessionCodec';
export type { ServiceResult, ExtractServiceResultData } from './application/types/ServiceResult';
export type {
  ICookieStore,
  CurrentSessionIdentity,
  ICurrentSessionIdentityResolver,
} from './application/services/CurrentSessionProvider';
export { createCookieSessionProvider } from './application/services/factory';

// ========================================
// DOMAIN LAYER EXPORTS
// ========================================
// NOTE: Selective exports to avoid bundling files with @ imports
// domain/types/common.ts has @ imports that break Turbopack
export * from './domain/auth';
export * from './domain/value-objects';
export * from './domain/types/common';
export { type Notification } from './domain/types/Notification';
export * from './domain/errors';
export * from './domain/constants/messages';
export * from './domain/constants/auth';
export * from './domain/constants/cache-tags';
// NOTE: utils NOT exported because it re-exports from types/common.ts which has @ imports
// export * as utils from "./domain/utils"; // REMOVED

// ========================================
// APPLICATION LAYER EXPORTS
// ========================================
export * from './application/interfaces';
export * from './application/types';
// NOTE: logging action NOT exported because it uses ServiceContainer with @ imports
// export * from "./application/actions/logging"; // REMOVED

// ========================================
// PRESENTATION LAYER EXPORTS
// ========================================
/**
 * CurrentSessionProvider is the framework-agnostic Current Session seam. Portal
 * adapters supply request-cookie access; signing, cookie policy, and refresh rules stay here.
 *
 */
export {
  CurrentSessionProvider,
  type CurrentSessionIdentity,
  type ActivePortal,
  type ICookieStore,
  type ICurrentSessionIdentityResolver,
} from './application/services/CurrentSessionProvider';
export { createCurrentSessionProvider } from './infrastructure/auth/createCurrentSessionProvider';

// ========================================
// INFRASTRUCTURE EXPORTS REMOVED
// ========================================
// Apps MUST NOT import infrastructure implementations.
// Repository contracts, factory functions, schema types,
// auth infrastructure, and ServiceContainer are internal implementation details.
//
// IMPORTANT: ServiceContainer (DI container) cannot be exported because:
// 1. It violates Clean Architecture (infrastructure should not be accessible to apps)
// 2. Next.js Turbopack cannot bundle it (has Node.js-only dependencies)
// 3. Apps should use exported application layer functions directly (queries, actions)
//
// Instead of:
//   import { container } from '@findeg/backend/features/core';
//   const service = container.someService;
//
// Use:
//   import { someQuery, someAction } from '@findeg/backend/features/[feature]';
//   const result = await someQuery(...);

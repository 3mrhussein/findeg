// ========================================
// DOMAIN LAYER EXPORTS
// ========================================
// NOTE: Selective exports to avoid bundling files with @ imports
// domain/types/common.ts has @ imports that break Turbopack
export * from "./domain/auth";
export * from "./domain/value-objects";
export * from "./domain/types/primitives"; // Simple schemas without @ deps
export * from "./domain/types/Notification";
export * from "./domain/errors";
export * from "./domain/constants/messages";
export * from "./domain/constants/auth";
export * from "./domain/constants/cache-tags";
// NOTE: utils NOT exported because it re-exports from types/common.ts which has @ imports
// export * as utils from "./domain/utils"; // REMOVED

// ========================================
// APPLICATION LAYER EXPORTS
// ========================================
export * from "./application/interfaces";
export * from "./application/types";
// NOTE: logging action NOT exported because it uses ServiceContainer with @ imports
// export * from "./application/actions/logging"; // REMOVED

// ========================================
// PRESENTATION LAYER EXPORTS
// ========================================
/**
 * CookieSessionProvider NOT exported because it (via JwtSessionManager) has @ imports
 * that break Turbopack bundling. Apps should implement their own session provider
 * or use a lightweight adapter pattern.
 *
 * @deprecated CookieSessionProvider is infrastructure and should not be used by apps.
 * This export was temporary to unblock dashboard session management during migration.
 * Target: Remove by 2026-05-01
 */
export {
  CookieSessionProvider,
  type ICookieStore,
} from "./infrastructure/auth/CookieSessionProvider";

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
//   import { container } from '@backend/features/core';
//   const service = container.someService;
//
// Use:
//   import { someQuery, someAction } from '@backend/features/[feature]';
//   const result = await someQuery(...);

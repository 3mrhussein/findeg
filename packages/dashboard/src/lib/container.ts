/**
 * Dashboard Service Container
 *
 * Provides access to backend services for dashboard Server Actions.
 *
 * ⚠️ ARCHITECTURAL NOTE:
 * This is a temporary adapter layer that allows dashboard Server Actions
 * to access backend services. The proper solution would be to refactor
 * dashboard actions to use backend's exported actions directly instead of
 * accessing services through DI.
 *
 * TODO: Refactor administration actions to use @backend/features/administration
 * exports instead of this container pattern.
 */

// Re-export backend infrastructure container
// This is a temporary workaround - apps should not access infrastructure directly
export { container } from "@backend/features/core";

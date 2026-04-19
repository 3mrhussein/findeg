/**
 * Primitive Type Schemas
 *
 * Simple, standalone Zod schemas with NO @ imports.
 * These can be safely exported from the core package without bundling issues.
 *
 * Note: This file was split from common.ts to avoid bundling domain/value-objects
 * which uses @ imports that break Turbopack.
 */

import { z } from "zod";

// ─── Email ──────────────────────────────────────────────────────────────────

export const EmailSchema = z.string().email();
export type Email = z.infer<typeof EmailSchema>;

// ─── Portal Role (Legacy v1 Session) ────────────────────────────────────────

export const PortalRoleSchema = z.enum(["customer", "staff", "school_staff"]);
export type PortalRole = z.infer<typeof PortalRoleSchema>;

// ─── ID ─────────────────────────────────────────────────────────────────────

/** Unique identifier across domain entities */
export const IdSchema = z.coerce.number().int().positive();
export type ID = z.infer<typeof IdSchema>;

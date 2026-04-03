# Authentication & Authorization Architecture

Last updated: 2026-02-19

This document defines the target concrete identity model and guard strategy used by FindEg.

## 1. Principles

- Authentication proves actor identity.
- Authorization is permission-based, not role-string based.
- Roles are assignment containers; permissions are enforcement primitives.
- Session payloads carry stable IDs; permission resolution happens server-side.
- Guest flows are first-class via persisted guest principals.

## 2. Target Identity Model

## Core Tables

- `users`: canonical user profile (person/business account owner).
- `auth_accounts`: linked external/local account identities (`provider`, `providerAccountId`).
- `password_credentials`: hashed password material for local auth only.
- `roles`: role catalog (`admin_ops`, `catalog_manager`, `buyer`, `business_buyer`).
- `permissions`: atomic permissions (`catalog.read`, `catalog.write`, `order.refund`).
- `role_permissions`: role-to-permission mapping.
- `user_roles`: direct role assignments.
- `organizations`: business entities/tenants.
- `organization_memberships`: user membership + scoped role assignments in org context.
- `payment_methods`: tokenized saved payment methods (never raw PAN/CVV).
- `guest_principals`: persisted guest actor records used by cart/checkout/session continuity.
- `sessions`: optional persisted session index/revocation tracking (token hash/jti lifecycle).

## Authentication Credentials

- Local login reads from `password_credentials.passwordHash`.
- OAuth/social login resolves through `auth_accounts`.
- A user may have multiple linked auth accounts.

## 3. Session Contract

Target session payload carries identity and scope identifiers:

```ts
type SessionActorType = "guest" | "user" | "service";

interface SessionPayloadV2 {
  subjectId: string; // userId or guestPrincipalId
  actorType: SessionActorType;
  activeRoleIds: string[];
  organizationId?: string;
  tokenVersion: number;
}
```

Current transitional implementation also carries optional `permissionCodes` in session for compatibility and performance during cutover.

Guard strategy:

- Middleware verifies token validity and baseline actor constraints.
- Route/API guards call permission service:
  - `hasPermission(actorContext, permissionCode)`
  - `hasAnyPermission(actorContext, permissionCodes[])`
  - `hasAllPermissions(actorContext, permissionCodes[])`

No direct checks like `session.role === "admin"` are allowed in new code outside compatibility helpers.

## 4. Authorization Resolution Flow

1. Validate token and load actor context.
2. Resolve scoped roles:
   - global user roles
   - organization membership roles (if `organizationId` present)
3. Resolve effective permission set from role mappings.
4. Evaluate requested permission(s).
5. Return allow/deny with structured denial reason for logs/audit.

## 5. Guest Model

- Anonymous sessions map to `guest_principals`.
- Guest principal can own cart and checkout intent data.
- Upon registration/login, guest state can be merged into user state through explicit application service.

## 6. Security and Compliance Rules

- Passwords are hashed (`bcrypt`/Argon2) with versioned strategy metadata.
- Sensitive tokens are encrypted or hashed at rest as applicable.
- Payment methods store provider token references only.
- Session revocation uses `tokenVersion` or server-side deny list.
- Audit logging is required for privileged operations and permission denials.

## 7. Clean Architecture Boundaries

- Domain: identity entities/value objects (`User`, `Role`, `Permission`, `Membership`, `GuestPrincipal`).
- Application: auth services and permission evaluators.
- Infrastructure: JWT/session adapter, credential repository, RBAC repository, payment token adapter.
- Delivery: API/middleware/page guards consume application contracts only.

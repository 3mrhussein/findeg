# Authentication & Authorization Architecture

This document describes the current authentication and authorization architecture and the roadmap for Phase 2.

## Current Architecture (Phase 1)

The system uses a **Clean Architecture** approach to encapsulate session management, ensuring the logic is reusable across different Next.js runtimes (Edge and Node.js).

### Core Components

1.  **`ISessionManager` (Interface)**: Defines the contract for authentication and authorization.
    - `validateSession(request: Request)`: Verifies credentials from headers or cookies.
    - `authorizeAdmin(session)`: Checks for the admin role.
    - `createToken(payload)`: Generates a new session token.
    - `getCookieSettings()`: Provides standardized cookie attributes.

2.  **`JwtSessionManager` (Implementation)**:
    - **Edge Compatible**: Uses the `jose` library for JWT operations.
    - **Centralized**: Holds the `JWT_SECRET` and session duration configurations.
    - **Usage**:
      - `src/proxy.ts`: Used in Edge Middleware for page-level access control (redirects to login).
      - `src/app/api/v1/_lib/middleware.ts`: Used in API wrappers (`withAuth`, `withAdmin`) for endpoint-level security (401/403 responses).

3.  **`CookieSessionProvider` (Storage Layer)**:
    - Implements `ISessionProvider`.
    - Uses `next/headers` to persist the JWT in HttpOnly cookies.
    - Delegates all crypto and validation logic back to `JwtSessionManager`.

---

## Phase 2 Roadmap: Permission-Based Authorization

In Phase 2, the system will evolve from a simple role-check (Admin vs. User) to a granular **Permission-Based System** to support various user types and fine-grained access control.

### Proposed Structure

#### 1. Permissions & User Types

- **Guest**: `VIEW_PRODUCTS`, `ADD_TO_CART`, `LOGIN`.
- **User**: `CREATE_ORDER`, `VIEW_OWN_PROFILE`, `MANAGE_OWN_ADDRESS`.
- **Admin**: `MANAGE_INVENTORY`, `VIEW_SALES_STATS`, `MANAGE_USERS`, `REFUND_ORDER`.

#### 2. Updated Payload

The `SessionPayload` will be expanded to include specific permissions or a permission bitmask:

```typescript
interface SessionPayload {
  userId: number;
  email: string;
  role: string;
  permissions: string[]; // e.g., ["ADMIN_DASHBOARD", "EDIT_PRODUCTS"]
}
```

#### 3. Granular Guards

The `SessionManager` will be updated with a `hasPermission` method:

```typescript
authorize(session: SessionPayload, requiredPermission: string): boolean {
  return session.permissions.includes(requiredPermission);
}
```

#### 4. Scalability Benefits

- **Multi-Tenancy**: Support for vendors who can only manage their own products.
- **Custom Roles**: Easily create "Support" or "Editor" roles by grouping existing permissions.
- **Third-Party Friendly**: The interface remains stable even if we switch to an external Identity Provider (IDP).

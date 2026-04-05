# Identity Feature

This feature module handles everything related to user accounts, authentication, and RBAC (Role-Based Access Control).

## Key Architecture Changes (Refactoring 2026)

The identity module has been refactored to follow stricter Clean Architecture principles and improve data security.

### 1. Database Schema Refactor

- **`identity.users`**:
  - Removed legacy `name` and `password` columns.
  - Renamed `role` to `portalRole` (Values: `customer`, `staff`, `school_staff`).
  - `portalRole` acts as a routing gate (e.g., `/admin` requires `staff` or `school_staff`).
- **`identity.password_credentials`**:
  - New table to store hashed passwords using different strategies (currently `bcrypt`).
  - This separates authentication secrets from user profile data.

### 2. Domain Models

- **`User.ts`**:
  - `name` property removed. Use `getFullName()` helper for resolution.
  - `role` replaced by `portalRole`.
  - Passwords are no longer part of the `User` entity.
- **`PasswordCredentials.ts`**:
  - New domain entity defining the structure for credentials stored in the DB.

### 3. Repository Standards

- **Repositories must be locale-unaware**.
- `DrizzleUserRepository` returns raw domain objects.
- All password logic is handled via `IUserRepository.findPasswordCredentials` and `upsertPasswordCredentials`.

### 4. Authentication Logic

- The project uses custom JWT authentication via `jose` (see `JwtSessionManager.ts`).
- Authentication secrets are verified using the `AuthService`.
- JWT payload contains `portalRole`, `organizationId`, and granular `roleIds` for RBAC.

## Important Helpers

- `isStaffRole(role: PortalRole)`: Checks if the user has staff privileges.
- `isSchoolRole(role: PortalRole)`: Checks if the user belongs to a school portal.
- `user.getFullName()`: Resolves the display name from first and last name with email fallback.

## Conventions

- **NEVER** add a `name` column back to `users`.
- **NEVER** store plain text or hashed passwords in the `users` table.
- Use `portalRole` for top-level access control and `role_permissions` for granular feature access.

# Identity Feature

The `identity` feature handles user authentication, registration, session management, and profile coordination. It ensures Secure access to the customer and administrative portals.

## Responsibilities

- **Authentication**: Secure login using hashed password verification.
- **Session Management**: JWT-based session handling with cookie persistence.
- **User Registration**: Creating and managing customer accounts.
- **Address Management**: Storing and retrieving user shipping addresses for checkout.
- **Authorization**: Role-based access control (RBAC) to distinguish between users and admins.

## Component Overview

### Domain Layer (`/domain`)

- **Entities**: `User` and `Address`.
- **Types**: Shared authentication results and session payloads.

### Application Layer (`/application`)

- **Ports**: `IAuthService` for auth flows and `IUserRepository` for data access.
- **Services**: `AuthService` implementation coordinating password hashing and session creation.

### Infrastructure Layer (`/infrastructure`)

- **Persistence**: Drizzle-based user and address repositories.
- **Security**: Argon2 or Bcrypt logic for password safety (implemented within services).

### Presentation Layer (`/presentation`)

- **Components**: Login/Registration forms, profile displays, and address management widgets.
- **Contexts**: `AuthContext` providing user state to the client-side application.

## Architectural Boundaries

- **Depends On**: `core` (for session storage and logging).
- **Used By**: Every feature that requires an authenticated user (e.g., `cart`, `order`, `review`).
- **Middleware**: Integrated with Next.js middleware for route protection.

# Identity Feature

Owns authentication, registration, session boundaries, and user profile/address access.

## Use Cases

```mermaid
flowchart LR
    Guest --> UC1[Register account]
    User --> UC2[Login]
    User --> UC3[Get current session]
    Admin --> UC4[Authorize admin routes]
```

## UML (Class View)

```mermaid
classDiagram
    class AuthService
    class IAuthService
    class IUserRepository
    class ISessionProvider
    class User

    AuthService ..|> IAuthService
    AuthService --> IUserRepository
    AuthService --> ISessionProvider
    IUserRepository --> User
```

## Sequence (Login)

```mermaid
sequenceDiagram
    participant API as POST /api/v1/auth/login
    participant Auth as AuthService
    participant UserRepo as IUserRepository
    participant Session as ISessionProvider
    API->>Auth: login(email, password)
    Auth->>UserRepo: getByEmailWithPassword(email)
    Auth->>Session: createSession(payload)
    Auth-->>API: AuthResult
```

## Layer Notes
- `domain`: user and auth/session DTO contracts.
- `application`: auth service and user repository ports.
- `infrastructure`: Drizzle user repository and JWT/cookie providers.

## Clean Architecture Boundaries
- Depends on `core` ports for session management.
- Used by all authenticated features.
- Route middleware should depend on session contracts, not repository internals.


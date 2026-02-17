# Core Feature

Provides shared kernel capabilities used across all features: ports, infrastructure adapters, DI composition, and shared primitives.

## Use Cases

```mermaid
flowchart LR
    Feature --> UC1[Resolve service from DI]
    Feature --> UC2[Persist data via shared DB config]
    Feature --> UC3[Create/validate session]
    Feature --> UC4[Log operational events]
```

## UML (Component/Class View)

```mermaid
classDiagram
    class ServiceContainer
    class ISessionProvider
    class CookieSessionProvider
    class ISessionManager
    class JwtSessionManager
    class ILoggerService
    class LoggerService

    CookieSessionProvider ..|> ISessionProvider
    JwtSessionManager ..|> ISessionManager
    LoggerService ..|> ILoggerService
    ServiceContainer --> ISessionProvider
    ServiceContainer --> ILoggerService
```

## Sequence (Route Auth Middleware)

```mermaid
sequenceDiagram
    participant Route as API Route
    participant MW as withAuth/withAdmin
    participant JWT as JwtSessionManager
    Route->>MW: wrapped request
    MW->>JWT: validateSession(request)
    JWT-->>MW: SessionPayload|null
    MW-->>Route: auth context or 401/403
```

## Layer Notes
- `domain`: shared auth and primitive types.
- `application`: cross-cutting ports/services.
- `infrastructure`: auth, persistence, storage, DI, logging.

## Clean Architecture Boundaries
- Core is dependency base; it does not depend on feature modules.
- New adapters must implement existing ports before DI registration.


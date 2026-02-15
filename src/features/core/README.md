# Core Feature

The `core` feature provides the foundational infrastructure and shared services used by all other features in the application. It follows a hexagonal architecture (Ports and Adapters) to ensure that technical details remain decoupled from business logic.

## Responsibilities

- **Dependency Injection**: Centralized management of service singletons via the `ServiceContainer`.
- **Infrastructure Abstractions**: Interfaces for logging, storage, sessions, and database persistence.
- **Shared Components**: Common UI elements, layouts, and utility functions used across the platform.
- **Internationalization**: Core i18n logic and CMS message management.

## Component Overview

### Application Layer (`/application`)

- **Ports**: Interfaces defining the contracts for shared infrastructure (e.g., `ILoggerService`, `IStorageProvider`, `ISessionProvider`).

### Infrastructure Layer (`/infrastructure`)

- **DI**: The `ServiceContainer` implementation that assembles the application.
- **Persistence**: Database connection setup and Drizzle schema definitions.
- **CMS**: Localized content and message catalogs.

### Presentation Layer (`/presentation`)

- **Components**: Primitive UI components (buttons, inputs, cards) built with Tailwind CSS.
- **Contexts**: React contexts for global state (e.g., UI state, session data).

## Architectural Boundaries

- **Upward Dependencies**: None. This module is the base level.
- **Downward Dependencies**: Components in `core/presentation` may be used by any other feature.
- **Extension Points**: New storage or logging providers should implement the corresponding ports in `application/ports`.

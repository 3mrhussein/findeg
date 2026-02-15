# Administration Feature

The `administration` feature provides the backend management tools for store owners. It encompasses product CRUD, inventory adjustments, order fulfillment, and administrative activity logging.

## Responsibilities

- **Inventory Control**: Real-time stock updates and low-stock alerting.
- **Product & Category CRUD**: Full management of the catalog with localization support.
- **Order Management**: Tracking, status updates, and fulfillment flows.
- **Audit Trailing**: Logging all administrative actions for accountability.
- **Dashboard Analytics**: Aggregated statistics on sales, customers, and inventory.

## Component Overview

### Domain Layer (`/domain`)

- **Entities**: `AuditLogEntry`.
- **Types**: Shared inputs for admin forms (`ProductInput`, `CategoryInput`).

### Application Layer (`/application`)

- **Ports**: Admin-specific service interfaces (`IAdminProductService`, `IAdminInventoryService`, `IAuditLogRepository`).
- **Services**: Implementations of business logic for admin actions, including validation and audit logging triggers.

### Infrastructure Layer (`/infrastructure`)

- **Persistence**: Repositories for audit logs and extended data access for admin listings.

### Presentation Layer (`/presentation`)

- **Components**: Data tables, complex forms, and statistical charts.
- **Server Actions**: Secured backend entry points for administrative mutations.

## Architectural Boundaries

- **Depends On**: `catalog` (data structures), `identity` (admin auth), `order` (fulfillment), `core` (logging/persistence).
- **Security**: Strictly protected by the `validateAdmin` guard in `AuthService`.
- **Communication**: Interacts with other features via their respective repositories but defines its own specialized services.

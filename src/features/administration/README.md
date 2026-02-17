# Administration Feature

Owns back-office operations: catalog CRUD, inventory control, order operations, and auditability.

## Use Cases

```mermaid
flowchart LR
    Admin --> UC1[Create/Update products]
    Admin --> UC2[Manage categories/brands]
    Admin --> UC3[Update inventory]
    Admin --> UC4[Update order status]
    Admin --> UC5[View dashboard and audit log]
```

## UML (Class View)

```mermaid
classDiagram
    class AdminProductService
    class AdminInventoryService
    class AdminOrderService
    class AuditLogService
    class IProductRepository
    class IOrderRepository
    class IAuditLogRepository

    AdminProductService --> IProductRepository
    AdminInventoryService --> IProductRepository
    AdminOrderService --> IOrderRepository
    AuditLogService --> IAuditLogRepository
```

## Sequence (Inventory Update)

```mermaid
sequenceDiagram
    participant API as PATCH /api/v1/admin/inventory/{productId}
    participant Service as AdminInventoryService
    participant Repo as IProductRepository
    participant Audit as AuditLogService
    API->>Service: updateStock(productId, quantity, threshold)
    Service->>Repo: updateStockConfiguration(...)
    Service->>Audit: logAction(inventory update)
    Service-->>API: success
```

## Layer Notes
- `domain`: admin DTOs + `AuditLogEntry`.
- `application`: admin services with policy and validation.
- `infrastructure`: audit and persistence adapters.

## Clean Architecture Boundaries
- Depends on `catalog`, `order`, `identity` contracts, and `core`.
- All admin mutations should be auditable.
- Admin UI/actions should call services/contracts, not raw repositories.


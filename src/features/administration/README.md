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

## Presentation Mappers

The `presentation/mappers/` directory contains transformation
functions that convert domain objects into UI-ready shapes.

### Why Mappers Exist

Domain objects are designed for business logic — they carry
raw JSONB, domain methods, and business rules. UI components
need flat, typed, locale-resolved values.

Mappers are the bridge between these two worlds. They are the
ONLY place where:

- JSONB is unpacked into locale-specific strings
- Domain objects are transformed into form values or card props
- `product.getName(locale)` is called to resolve display text

### Current Mappers

| File                     | Transforms                      | Used By                 |
| ------------------------ | ------------------------------- | ----------------------- |
| `product-form-mapper.ts` | `Product` → `ProductFormValues` | Admin create/edit pages |

### Adding A New Mapper

When building a new admin feature that needs to pre-populate a
form or transform a domain object for display:

1. Create `presentation/mappers/your-entity-mapper.ts`
2. Import the domain entity type
3. Export a named `toYourEntityFormValues(entity)` function
4. Call domain entity locale methods — never unpack JSONB directly
5. Use `toEmptyYourEntityFormValues()` for create mode defaults

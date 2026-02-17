# Order Feature

Owns checkout orchestration and order lifecycle, including immutable line-item snapshots.

## Use Cases

```mermaid
flowchart LR
    Shopper --> UC1[Validate checkout]
    Shopper --> UC2[Create order]
    Shopper --> UC3[View order history]
    Admin --> UC4[Update order status]
```

## UML (Class View)

```mermaid
classDiagram
    class Order
    class OrderItem
    class IOrderRepository
    class DrizzleOrderRepository

    Order --> OrderItem
    DrizzleOrderRepository ..|> IOrderRepository
```

## Sequence (Checkout to Order)

```mermaid
sequenceDiagram
    participant CheckoutAPI as /api/v1/checkout/order
    participant Cart as CartService
    participant Product as ProductService
    participant Repo as IOrderRepository
    CheckoutAPI->>Cart: getCart(cartId)
    CheckoutAPI->>Product: getById(...) for snapshots
    CheckoutAPI->>Repo: create(order + orderItems snapshots)
    Repo-->>CheckoutAPI: persisted order
```

## Layer Notes
- `domain`: `Order`, `OrderItem`, `ShippingAddress`, `VariantSnapshot`.
- `application`: repository contracts and checkout-facing actions.
- `infrastructure`: Drizzle persistence and analytics queries.

## Clean Architecture Boundaries
- Depends on `cart` and `catalog` contracts for data capture.
- Must preserve historical snapshot integrity despite catalog changes.
- Administration reads/updates order lifecycle via service contracts.


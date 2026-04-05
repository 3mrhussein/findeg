# Cart Feature

Owns cart lifecycle for guest and authenticated sessions, including pricing snapshots used at checkout.

## Use Cases

```mermaid
flowchart LR
    Shopper --> UC1[Add item to cart]
    Shopper --> UC2[Update quantity]
    Shopper --> UC3[Remove item]
    Checkout --> UC4[Read cart snapshot]
```

## UML (Class View)

```mermaid
classDiagram
    class CartEntity
    class CartItem
    class CartService
    class ICartService

    CartService ..|> ICartService
    CartService --> CartEntity
    CartEntity --> CartItem
```

## Sequence (Add Item with Pricing Context)

```mermaid
sequenceDiagram
    participant API as POST /api/v1/cart/items
    participant PS as ProductService
    participant CS as CartService
    API->>PS: quoteVariantUnitPrice(...)
    PS-->>API: unitPriceSnapshot
    API->>CS: addItem(cartId, {uomCode, customerGroup, unitPriceSnapshot})
    CS-->>API: updated cart
```

## Layer Notes
- `domain`: `CartEntity` and cart totals logic.
- `application`: cart service contract and managed cart operations.
- `infrastructure`: currently in-memory cart persistence path.

## Clean Architecture Boundaries
- Depends on `catalog` for product/price context.
- Feeds `order` as source of checkout snapshots.
- Cart logic must remain decoupled from direct DB order writes.


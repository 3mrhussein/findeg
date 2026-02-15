# Order Feature

The `order` feature manages the checkout process and the lifecycle of a customer's purchase. It handles order creation, status tracking, and fulfillment coordination.

## Responsibilities

- **Checkout Coordination**: Assembling the cart items, shipping address, and payment method into an order.
- **Order Lifecycle**: Managing status transitions (Pending → Processing → Shipped → Delivered).
- **Snapshot management**: Capturing product prices and descriptions at time of purchase to ensure historical accuracy.
- **Financial Tracking**: Calculating subtotals, shipping costs, and final totals.

## Component Overview

### Domain Layer (`/domain`)

- **Entities**: `Order` and `OrderItem`.
- **Value Objects**: `ShippingAddress` snapshot and `VariantSnapshot`.

### Application Layer (`/application`)

- **Ports**: `IOrderRepository` for order persistence and `IOrderService` for customer actions.
- **Services**: Logic for order placement, including inventory reservation triggers.

### Infrastructure Layer (`/infrastructure`)

- **Persistence**: Drizzle-based repository for orders and their line items.

### Presentation Layer (`/presentation`)

- **Components**: Checkout flow, Order History lists, and detailed Order Status views.

## Architectural Boundaries

- **Depends On**: `catalog` (for item snapshots), `cart` (source of data), `identity` (user associations).
- **Used By**: `administration` (for fulfillment and analytics).
- **External Integration**: Designed to be extended with payment gateway adapters.

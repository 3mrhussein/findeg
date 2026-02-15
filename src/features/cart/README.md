# Cart Feature

The `cart` feature provides temporary storage for products that the user intends to buy. It supports both guest and registered user sessions.

## Responsibilities

- **Line Item Management**: Adding, updating, and removing products from the cart.
- **Cart Persistence**: Storing cart state in database (for users) or local storage/cookies (for guests).
- **Subtotal Calculation**: Real-time pricing updates as items are modified.
- **Stock Validation**: Ensuring items in the cart are still available in the catalog.

## Component Overview

### Domain Layer (`/domain`)

- **Entities**: `Cart` and `CartItem`.

### Application Layer (`/application`)

- **Ports**: `ICartRepository` and `ICartService`.
- **Hooks**: `useCart` (for client-side interactions and state management).

### Presentation Layer (`/presentation`)

- **Components**: Cart Sidebar, Cart Page, and "Add to Cart" buttons.

## Architectural Boundaries

- **Depends On**: `catalog` (for product pricing and stock), `identity` (for user association).
- **Used By**: `order` (as the source for checkout).

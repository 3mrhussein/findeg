# Catalog Feature

The `catalog` feature manages the product inventory, categories, and brand information. It provides the customer-facing shop experience and supports the administration's inventory management.

## Responsibilities

- **Product Management**: Retrieval and filtering of products, stock level tracking, and pricing calculations.
- **Hierarchical Categories**: Organizing products into a tree-based category structure.
- **Brand Management**: Associating products with manufacturing brands.
- **Multi-language Search**: Full-text search across localized names and descriptions.

## Component Overview

### Domain Layer (`/domain`)

- **Entities**: Core structures like `Product`, `Category`, and `Brand`.
- **ProductEntity**: Domain logic for computing prices (with variants) and stock status.

### Application Layer (`/application`)

- **Ports**: Interface definitions for repositories (`IProductRepository`) and services (`IProductService`).
- **Services**: Business flows for fetching shop-facing data.

### Infrastructure Layer (`/infrastructure`)

- **Persistence**: Drizzle-based implementations for data access, handling complex joins for localized content.

### Presentation Layer (`/presentation`)

- **Components**: Shop UI elements like Product Cards, Category Lists, and Filtering Sidebars.
- **Templates**: Full page layouts for Product Listing, Detail, and Search pages.

## Architectural Boundaries

- **Depends On**: `core` (for persistence and UI tokens).
- **Used By**: `administration` (for CRUD operations), `cart` (to validate product details).
- **Communication**: Exposed via `IProductService`. Administration uses `IAdminProductService` which is strictly separated.

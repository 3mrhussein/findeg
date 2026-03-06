# FindEg.com — System Specification

> **Version:** 1.6 · **Updated:** 2026-03-06 · **Current Phase:** Phase 1 (Nearing Completion) · **Focus:** Multi-UoM Commerce & School List Scaffolding

---

## 1. Vision & Business Model

**FindEg.com** is a modern education-focused e-commerce platform for the Egyptian market, specializing in stationery and school supplies. It combines a **public B2C shop** (web + mobile) with a future **school integration layer (B2B2C)** that automates supply-list distribution and purchasing.

> _From classroom requirements to a ready-to-buy cart in minutes._

### Current Business Goal (Dual Track)

As of **February 16, 2026**, FindEg follows a **balanced dual-track strategy**:

1. **Short-term B2C growth**: maximize conversion and order throughput in the public storefront.
2. **Mid-term B2B2C readiness**: preserve clean architecture boundaries so school workflows can be introduced without a rewrite of Phase 1 commerce flows.

**Operating goal statement:**
Become the default back-to-school commerce platform in Egypt by converting retail shoppers efficiently now (`catalog -> cart -> checkout -> fulfillment`) while preparing the platform for school-driven purchasing workflows (lists, templates, institutional journeys) next.

### Core Differentiator

- Schools prepare supply lists.
- Parents open a shared link/QR and land in a pre-filled cart.
- Parents can modify options if school policy allows.
- School co-branding overlays increase trust and conversion.

### Platform Strategy

```mermaid
graph TB
    subgraph "Client Applications"
        WEB["🌐 Web App<br/>Next.js (SSR)"]
        MOBILE["📱 Mobile App<br/>React Native / Expo"]
        ADMIN["⚙️ Admin Dashboard<br/>Next.js (same codebase)"]
    end

    subgraph "Backend"
        API["REST API<br/>/api/v1/*"]
        SA["Server Actions<br/>(Web-only mutations)"]
    end

    subgraph "Core Services"
        SVC["Application Services<br/>Auth · Products · Cart · Orders"]
    end

    subgraph "Data"
        DB[("PostgreSQL")]
        CDN["CDN<br/>Images & Assets"]
    end

    WEB --> SA --> SVC
    WEB --> API
    MOBILE --> API --> SVC
    ADMIN --> SA
    SVC --> DB
    WEB --> CDN
    MOBILE --> CDN
```

One catalog. One checkout. One API. Three client surfaces (web, mobile, admin).

### Revenue Streams

| Stream                   | Phase | Description                                                 |
| ------------------------ | ----- | ----------------------------------------------------------- |
| **Product margins**      | 1 ✅  | Markup on stationery sales                                  |
| **Bundles & kits**       | 1     | Pre-assembled school supply packs                           |
| **Upsells & add-ons**    | 1     | Related product suggestions                                 |
| **School subscriptions** | 3     | SaaS for supply list management, co-branded links, QR codes |

### Market Context

- **Region:** Egypt (EGP currency)
- **Languages:** Arabic (primary) + English
- **Peak Season:** August–September (Back to School) — 10–40× normal traffic
- **Go-to-Market:** Launch public shop (web + mobile) → pilot with 2–3 private schools → scale

### Success Criteria (Dual)

1. **Commerce outcomes:** Improve checkout completion, repeat order rate, and fulfillment reliability.
2. **Platform readiness outcomes:** Add school-domain features using isolated modules and clear contracts with minimal refactor risk.
3. **Operational outcomes:** Keep admin operations fully functional for catalog, inventory, order lifecycle, and auditability.

### Current-Phase Design Directives

- Build and operate a production-grade public B2C marketplace now.
- Keep taxonomy customer-friendly and stable, with admin-controlled category/sub-category linking.
- Prioritize import automation and deterministic catalog operations in admin.
- Prepare schema and domain extensions now for school and multi-UoM requirements while keeping web/mobile clients in this repo aligned.

---

## 2. Actors & Use Cases

### System Actors

```mermaid
graph TB
    subgraph "Phase 1 — Active"
        GUEST["👤 Guest Shopper<br/>(Web + Mobile)"]
        CUSTOMER["👤 Registered Customer<br/>(Web + Mobile)"]
        ADMIN["🔧 Platform Admin<br/>(Web Dashboard)"]
    end

    subgraph "Phase 2–3 — Future"
        TEACHER["👩‍🏫 Teacher"]
        SCHOOL["🏫 School Admin"]
    end

    subgraph "FindEg Platform"
        direction TB
        SHOP["🛒 Public Shop<br/>Web + Mobile"]
        DASH["📊 Customer Dashboard"]
        APANEL["⚙️ Admin Panel"]
        TTOOLS["📋 Teacher Tools"]
        SCTX["🏫 School Context"]
    end

    GUEST --> SHOP
    CUSTOMER --> SHOP
    CUSTOMER --> DASH
    ADMIN --> APANEL
    TEACHER -.-> TTOOLS
    SCHOOL -.-> SCTX
```

### Use Case Map

```mermaid
graph LR
    subgraph "Customer Use Cases — Phase 1"
        UC1["Browse by category<br/>(nested tree)"]
        UC2["Search & filter<br/>(price, brand, category)"]
        UC3["View product details<br/>(variants, images, reviews)"]
        UC4["Manage cart"]
        UC5["Guest checkout"]
        UC6["Register / Login"]
        UC7["View order history"]
        UC8["Track order status"]
    end

    subgraph "Admin Use Cases — Phase 1"
        UC9["Manage products<br/>(CRUD + bulk import)"]
        UC10["Manage categories<br/>(nested tree + reorder)"]
        UC11["Manage brands"]
        UC12["Manage media assets"]
        UC13["Manage inventory"]
        UC14["Manage orders<br/>(status, tracking, refunds)"]
        UC15["View dashboard<br/>(KPIs, charts, alerts)"]
    end

    subgraph "Future Use Cases — Phase 2–3"
        UC16["Create supply lists"]
        UC17["Grade-level aggregation"]
        UC18["Generate school links / QR"]
        UC19["School-branded shopping"]
    end
```

### Admin Roles (Phase 1)

| Role                | Permissions                                                   |
| ------------------- | ------------------------------------------------------------- |
| **Super Admin**     | Full system access — users, payments config, settings         |
| **Catalog Manager** | Product CRUD, brand CRUD, category tree, media assets         |
| **Operations**      | Order management, status updates, tracking, refund initiation |

---

## 3. Phased Roadmap

```mermaid
gantt
    title FindEg Platform Roadmap
    dateFormat YYYY-MM
    axisFormat %b %Y

    section Phase 1 — Public E-Shop + Admin
    Product catalog & search          :done, p1a, 2025-10, 2026-01
    Cart & checkout UI                :done, p1b, 2025-12, 2026-02
    Admin dashboard & CRUD            :done, p1c, 2026-01, 2026-02
    REST API layer                    :done, p1api, 2026-02, 2026-03
    Multi-UoM data model uplift       :done, p1uom, 2026-02, 2026-03
    Bulk import hardening             :done, p1imp, 2026-02, 2026-03
    Payment integration (Paymob)      :active, p1d, 2026-02, 2026-04
    Order mgmt & fulfillment (admin)  :active, p1e, 2026-03, 2026-05
    Mobile app (React Native)         :active, p1m, 2026-03, 2026-06
    Web launch                        :milestone, p1f, 2026-05, 0d
    Mobile launch                     :milestone, p1g, 2026-06, 0d

    section Phase 2 — Teacher Tools
    Teacher accounts & class lists    :p2a, 2026-07, 2026-09
    Supply rules & templates          :p2b, 2026-08, 2026-10

    section Phase 3 — School Integration
    School accounts & co-branding     :p3a, 2026-10, 2026-12
    QR codes & parent links           :p3b, 2026-11, 2027-01

    section Phase 4 — Scale
    Analytics & optimization          :p4a, 2027-02, 2027-04
```

### Phase 1 Scope — Three Pillars

Phase 1 delivers **three parallel workstreams** that share a single backend:

```mermaid
graph LR
    subgraph "Pillar 1: Customer Web App"
        W1["Catalog browsing"]
        W2["Search & category filters"]
        W3["Cart & checkout"]
        W4["Account & order history"]
    end

    subgraph "Pillar 2: Admin Dashboard"
        A1["Product CRUD + bulk import"]
        A2["Category tree management"]
        A3["Brand & asset management"]
        A4["Order lifecycle & tracking"]
        A5["Inventory management"]
        A6["Dashboard KPIs & charts"]
    end

    subgraph "Pillar 3: Mobile App"
        M1["Shared REST API"]
        M2["Same catalog & checkout"]
        M3["Push notifications"]
        M4["Native UX patterns"]
    end

    BACKEND["Shared Backend<br/>REST API + Services + DB"] --> W1
    BACKEND --> A1
    BACKEND --> M1
```

**In scope:**

- Public product browsing, search, nested category filtering
- Product details with variants (color, size)
- Cart & checkout (guest + registered) — web + mobile
- User registration, login, account management
- Admin dashboard: product/category/brand CRUD, order lifecycle, inventory, reporting
- REST API for all features (required for mobile app)
- i18n (EN/AR), RTL, mobile-first, SEO
- Phase 1 schema/domain uplift for multi-UoM selling and customer-group pricing
- Admin-controlled product-to-sub-category linking (no supplier taxonomy mapping layer)

**Out of scope (deferred):**

- School/teacher accounts, supply lists, QR codes, subscriptions
- Advanced analytics, multi-country pricing

---

## 4. User Flows

### Shopping Flow (Web + Mobile)

```mermaid
flowchart TD
    START(["🏠 Homepage"]) --> BROWSE["Browse Category Tree<br/>(nested: Pens → Ballpoint → Blue)"]
    START --> SEARCH["🔍 Search Products"]
    START --> FEATURED["View Featured / New"]

    BROWSE --> PLP["📋 Product Listing Page<br/>Filters: category tree, brand, price range<br/>Sort: popular, price, newest"]
    SEARCH --> PLP
    FEATURED --> PLP

    PLP --> PDP["📦 Product Detail Page<br/>Images, price, variants, stock<br/>Related products, reviews"]

    PDP --> VARIANT{"Select variant?"}
    VARIANT -->|"Color / Size"| ADD["🛒 Add to Cart<br/>(toast + counter animation)"]
    VARIANT -->|"No variants"| ADD

    ADD --> CART["Cart Drawer / Page<br/>Edit qty, remove items, subtotal"]

    CART --> CHECKOUT{"Checkout"}
    CHECKOUT -->|"Guest"| ADDR["📍 Address Form<br/>Name, Phone, City, Area, Street"]
    CHECKOUT -->|"Registered"| ADDR

    ADDR --> DELIVERY["🚚 Delivery Options<br/>Standard / Express"]
    DELIVERY --> PAY["💳 Payment<br/>Paymob Card / Wallet / COD"]
    PAY --> CONFIRM["✅ Order Confirmation<br/>Order #, summary, ETA, tracking"]

    style START fill:#4f46e5,color:#fff
    style CONFIRM fill:#059669,color:#fff
    style ADD fill:#f59e0b,color:#000
```

### Checkout Sequence (Multi-UoM & Pricing Resolution)

This diagram shows how the system resolves the correct price during the checkout journey, accounting for the user's customer group and selected Unit of Measure.

```mermaid
sequenceDiagram
    participant C as Customer (Web/Mobile)
    participant API as API / Server Action
    participant PS as Product Service
    participant PR as Pricing Repository
    participant DB as PostgreSQL

    C->>API: Add to Cart (variantId, uomCode, qty)
    API->>PS: Resolve Price (variantId, uomCode, customerGroup, qty)
    PS->>PR: Fetch Price List row
    PR->>DB: SELECT FROM variant_price_lists
    DB-->>PR: Price Row (unitPrice, currency, isSellable)
    PR-->>PS: Price Result
    PS->>PS: Apply factor_to_base validation
    PS-->>API: Effective Price
    API-->>C: Item Added with Snapshotted Price
```

### Admin Bulk Import Sequence (Deterministic Upsert)

This diagram explains the "Hardened Import" logic that ensures no duplicate products/variants are created during bulk CSV updates.

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as Admin API
    participant IS as Import Service
    participant ARS as Admin Product Service
    participant DB as PostgreSQL

    A->>API: Upload CSV
    API->>IS: Process Rows
    loop for each row
        IS->>ARS: Upsert Product (sku, data)
        ARS->>DB: Check if SKU exists
        alt exists
            ARS->>DB: UPDATE products / variants
        else not exists
            ARS->>DB: INSERT products / variants
        end
        ARS->>DB: Upsert Translations (en/ar)
        ARS->>DB: Upsert UoMs & Pricing
        ARS-->>IS: Success / Error
    end
    IS-->>API: Import Results Summary
    API-->>A: Show Success/Errors Dashboard
```

### Category Browsing — Nested Tree Filtering

```mermaid
flowchart LR
    ROOT["All Categories"] --> L1A["📁 Writing Supplies"]
    ROOT --> L1B["📁 Paper Products"]
    ROOT --> L1C["📁 Art Supplies"]

    L1A --> L2A["📁 Pens"]
    L1A --> L2B["📁 Pencils"]
    L1A --> L2C["📁 Markers"]

    L2A --> L3A["Ballpoint Pens"]
    L2A --> L3B["Gel Pens"]
    L2A --> L3C["Fountain Pens"]

    L1B --> L2D["📁 Notebooks"]
    L1B --> L2E["📁 Sticky Notes"]

    click L2A "Selecting 'Pens' shows all children:<br/>Ballpoint + Gel + Fountain"
```

When a user selects a parent category (e.g., "Pens"), the system queries all descendants using `path` or `ltree`, returning products from the selected category **and all children** — this is the core nested category filtering behavior.

### Admin Flow (Phase 1)

```mermaid
flowchart TD
    LOGIN["🔐 Admin Login"] --> DASH["📊 Dashboard<br/>Revenue today · Order count · Low stock alerts<br/>Top products · Sales charts"]

    DASH --> PRODUCTS["📦 Products"]
    DASH --> CATEGORIES["📂 Categories"]
    DASH --> BRANDS["🏷️ Brands"]
    DASH --> ORDERS["📋 Orders"]
    DASH --> INVENTORY["📊 Inventory"]
    DASH --> ASSETS["🖼️ Media Assets"]

    PRODUCTS --> P_LIST["Product List<br/>Image, name, brand, category, price, stock, status"]
    P_LIST --> P_CREATE["Create Product<br/>Basic info, pricing, inventory (SKU, stock),<br/>media upload, category, variants, status"]
    P_LIST --> P_EDIT["Edit Product"]
    P_LIST --> P_BULK["Bulk Actions<br/>CSV import · status update · price update"]

    CATEGORIES --> C_TREE["Category Tree View<br/>Drag-drop reorder · Nested hierarchy"]
    C_TREE --> C_EDIT["Create / Edit Category<br/>Name (EN/AR), slug, icon, parent, sort order"]

    ORDERS --> O_LIST["Order List<br/>Filter: status, date, payment method, customer"]
    O_LIST --> O_DETAIL["Order Detail<br/>Customer info, items, payment status, timeline"]
    O_DETAIL --> O_ACTION["Update Status · Add Tracking # · Refund · Notes"]

    INVENTORY --> INV_LIST["Inventory View<br/>Product, SKU, current stock, reorder level"]
    INV_LIST --> INV_EDIT["Inline Edit · Bulk Update"]

    style LOGIN fill:#4f46e5,color:#fff
    style DASH fill:#059669,color:#fff
```

### Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending : Order created
    pending --> confirmed : Admin confirms
    pending --> cancelled : Customer cancels / Timeout
    confirmed --> processing : Payment verified
    processing --> shipped : Shipped + tracking #
    shipped --> delivered : Delivery confirmed
    delivered --> [*]

    processing --> refunded : Refund requested
    shipped --> returned : Return initiated
    returned --> refunded
    refunded --> [*]
    cancelled --> [*]
```

### School-Context Flow (Phase 2+ — Future)

```mermaid
flowchart TD
    TEACHER["👩‍🏫 Teacher creates<br/>class supply list"] --> SUBMIT["Submit to grade pool"]
    SUBMIT --> AGGREGATE["System aggregates<br/>lists per grade"]
    AGGREGATE --> REVIEW["🏫 School Admin reviews<br/>duplicates & conflicts"]
    REVIEW --> APPROVE["Approve Unified<br/>Grade Supply List"]
    APPROVE --> LINK["Generate parent link<br/>+ QR code"]
    LINK --> PARENT["👨‍👩‍👧 Parent opens link"]
    PARENT --> PREFILLED["Pre-filled cart<br/>Required + Optional items<br/>School branding"]
    PREFILLED --> SWAP{"Brand-optional items?"}
    SWAP -->|"Swap brand"| CHECKOUT["Checkout"]
    SWAP -->|"Keep default"| CHECKOUT

    style TEACHER fill:#8b5cf6,color:#fff
    style PARENT fill:#4f46e5,color:#fff
    style CHECKOUT fill:#059669,color:#fff
```

---

## 5. Architecture

### Clean Architecture Layers

```mermaid
graph TD
    subgraph "Client Layer"
        WEB["🌐 Next.js Web App"]
        MOB["📱 React Native Mobile App"]
    end

    subgraph "Framework Layer — src/app/"
        FW["Next.js App Router<br/>Routes · Layouts · Pages · Server Actions"]
        REST["REST API Routes<br/>/api/v1/*"]
    end

    subgraph "Application Layer — src/features/*/application/"
        APP["Services · Repository Interfaces<br/>Auth · Products · Cart · Orders · Admin"]
    end

    subgraph "Domain Layer — src/features/*/domain/"
        DOM["Entities & Business Rules<br/>Product · Cart · Category · Order · User<br/>Zero external dependencies"]
    end

    subgraph "Infrastructure Layer — src/features/*/infrastructure/"
        INFRA["Drizzle ORM Repositories · PostgreSQL<br/>JWT Auth · CMS · DI Container"]
    end

    WEB --> FW
    MOB --> REST
    FW --> APP
    REST --> APP
    APP --> DOM
    INFRA -.->|"implements interfaces"| APP

    style DOM fill:#059669,color:#fff
    style INFRA fill:#6366f1,color:#fff
    style REST fill:#f59e0b,color:#000
```

### Domain Model (UML Class Diagram)

The following diagram illustrates the core domain entities and their structural relationships, adhering to Domain-Driven Design principles.

```mermaid
classDiagram
    class Product {
        +ID id
        +LocalizedString name
        +LocalizedString description
        +Rating rating
        +Boolean isActive
        +getFeaturedVariants()
    }
    class ProductVariant {
        +ID id
        +Sku sku
        +Price basePrice
        +Quantity stock
        +UomCode baseUom
        +Boolean isActive
        +resolvePrice(customerGroup, uom)
    }
    class Category {
        +ID id
        +Slug slug
        +LocalizedString name
        +String path
        +getBreadcrumbs()
    }
    class Order {
        +ID id
        +OrderStatus status
        +Price total
        +DateTime createdAt
        +calculateTotals()
    }
    class User {
        +ID id
        +Email email
        +UserRole role
        +hasPermission(code)
    }

    Product "1" *-- "many" ProductVariant : contains
    Product "many" -- "1" Category : categorized by
    Order "many" -- "0..1" User : placed by
    ProductVariant "many" -- "many" Order : appears in
```

**Dependency rule:** All arrows point inward. Domain has zero dependencies. Infrastructure implements contracts defined by Application. The REST API and Server Actions are two different entry points into the same Application Services.

### Technology Stack

| Layer                | Technology                                        |
| -------------------- | ------------------------------------------------- |
| **Web Framework**    | Next.js 16 (App Router), React 19, TypeScript 5.7 |
| **Mobile**           | React Native / Expo (planned, shares API layer)   |
| **Database**         | PostgreSQL (Docker) + Drizzle ORM                 |
| **Styling (Web)**    | Tailwind CSS 3.4, CSS variables for theming       |
| **UI Library (Web)** | shadcn/ui (Radix primitives), Lucide icons        |
| **i18n**             | next-intl 4.7 (EN/AR, RTL support)                |
| **Auth**             | jose (JWT) + bcryptjs (password hashing)          |
| **Forms**            | react-hook-form + zod validation                  |
| **State**            | React Context (Cart, User, Theme providers)       |
| **Dev Tools**        | ESLint 9, Prettier, JSDoc, Drizzle Kit, Docker    |

### Service Architecture

```mermaid
graph LR
    subgraph "DI Container (Singleton)"
        direction TB

        subgraph "Repositories"
            R1["ProductRepository"]
            R2["CategoryRepository"]
            R3["UserRepository"]
            R4["OrderRepository"]
            R5["ReviewRepository"]
        end

        subgraph "Shop Services"
            S1["AuthService"]
            S2["ProductService"]
            S3["CategoryService"]
            S4["CartService"]
        end

        subgraph "Admin Services"
            A1["AdminProductService"]
            A2["AdminCategoryService"]
            A3["AdminDashboardService"]
            A4["AdminOrderService"]
            A5["AdminInventoryService"]
        end
    end

    S1 --> R3
    S1 --> SP["SessionProvider"]
    S2 --> R1
    S3 --> R2
    A1 --> R1
    A2 --> R2
    A3 --> R4
    A4 --> R4
    A5 --> R1
```

### Feature Module Architecture

Findeg follows a modular monolith structure where features are isolated by domain boundaries. Each feature contains its own Domain, Application, and Infrastructure layers.

```mermaid
componentDiagram
    [Core Feature] as CORE
    [Catalog Feature] as CAT
    [Order Feature] as ORD
    [Identity Feature] as IDEN
    [Review Feature] as REV

    CAT ..> CORE : uses common types
    ORD ..> CAT : references products
    ORD ..> IDEN : verifies users
    REV ..> CAT : attaches to products
    REV ..> IDEN : identifies authors

    package "Shared / Internal" {
        [UI Components]
        [Internal Helpers]
        [Permissions]
    }

    CAT -- [UI Components]
    CORE -- [Permissions]
```

All services expose **interface types** (e.g., `IProductService`) so implementations can be swapped for testing or future changes.

---

## 6. Database Schema

### ER Diagram (Phase 1)

```mermaid
erDiagram
    PRODUCTS {
        serial id PK
        integer category_id FK "FK → categories"
        integer brand_id FK "FK → brands"
        boolean is_active "Visibility toggle"
        decimal rating "Avg rating (1-5)"
        integer reviews_count "Cached count"
        timestamp created_at
        timestamp updated_at
    }

    PRODUCT_TRANSLATIONS {
        integer product_id FK "PK part 1"
        text language "PK part 2 (en/ar)"
        text name
        text description
        text long_description
        timestamp created_at
    }

    PRODUCT_VARIANTS {
        serial id PK
        integer product_id FK
        text sku "Unique SKU code"
        text variant_key "e.g., blue-0.7"
        jsonb localized_label
        integer display_order
        boolean is_active
        decimal base_price "B2C sticker price"
        decimal strike_price
        decimal cost_price
        integer weight_grams
        text barcode
        integer low_stock_threshold
        timestamp created_at
    }

    VARIANT_IMAGES {
        serial id PK
        integer variant_id FK
        text url
        text alt
        integer display_order
    }

    VARIANT_ATTRIBUTES {
        integer variant_id FK "PK part 1"
        integer attribute_id FK "PK part 2"
        text value_text
        decimal value_num
        boolean value_bool
    }

    ATTRIBUTE_DEFINITIONS {
        serial id PK
        text name "e.g., ink_color"
        text type "text/number/bool"
        jsonb localized_label
    }

    VARIANT_SELLABLE_UOMS {
        serial id PK
        integer variant_id FK
        text uom_code "pcs/pack/carton"
        decimal factor_to_base
        jsonb localized_label
        text barcode
        boolean is_enabled
    }

    VARIANT_PRICE_LISTS {
        serial id PK
        integer variant_id FK
        text customer_group "public_b2c/school_b2b"
        text uom_code
        text currency "EGP"
        decimal unit_price
        integer min_qty "Tiered pricing"
        boolean is_sellable
        timestamp starts_at
        timestamp ends_at
    }

    CATEGORIES {
        serial id PK
        text slug "Unique, URL-safe"
        integer parent_id FK "Self-ref"
        text path "Materialized path"
        integer depth
        integer sort_order
        boolean is_active
        text icon
        timestamp created_at
    }

    CATEGORY_TRANSLATIONS {
        integer category_id FK "PK part 1"
        text language "PK part 2"
        text name
        text description
    }

    WAREHOUSES {
        serial id PK
        text code "Unique code (MAIN)"
        text name
        boolean is_active
    }

    INVENTORY_BALANCES {
        serial id PK
        integer variant_id FK
        integer warehouse_id FK
        integer on_hand "Physical stock"
        integer reserved "Pending orders"
        timestamp updated_at
    }

    STOCK_MOVEMENTS {
        serial id PK
        integer variant_id FK
        integer warehouse_id FK
        text movement_type "receipt/sale/adj/..."
        integer quantity
        text reference_type
        text reference_id
        integer created_by FK
        timestamp created_at
    }

    BRANDS {
        serial id PK
        text slug "Unique"
        text name
        text logo_url
        boolean is_active
    }

    USERS {
        serial id PK
        text email "Unique"
        text password_hash
        text first_name
        text last_name
        text role "admin/user"
    }

    ADDRESSES {
        serial id PK
        integer user_id FK
        text label "Home/Work"
        text full_name
        text phone
        text city
        text area
        text street
        boolean is_default
    }

    ORDERS {
        serial id PK
        integer user_id FK
        text status "pending/confirmed/processing/..."
        decimal subtotal
        decimal shipping_cost
        decimal total_amount
        text payment_method
        text payment_status
        text tracking_number
        jsonb shipping_address_snapshot
        timestamp created_at
    }

    ORDER_ITEMS {
        serial id PK
        integer order_id FK
        integer variant_id FK
        text product_name_snapshot
        text product_sku_snapshot
        decimal unit_price_snapshot
        integer quantity
        text uom_snapshot
        decimal conversion_factor_snapshot
    }

    SCHOOL_LISTS {
        serial id PK
        text slug "Unique deep link"
        text school_name
        text grade
        text academic_year
        jsonb localized_title
        jsonb localized_description
        text hero_image_url
        boolean is_active
        timestamp published_at
    }

    SCHOOL_LIST_ITEMS {
        serial id PK
        integer school_list_id FK
        integer display_order
        jsonb localized_label
        integer category_id FK
        integer quantity_required
        boolean is_locked
        jsonb match_rules "Auto-matching filters"
    }

    SCHOOL_LIST_ITEM_ALTERNATIVES {
        serial id PK
        integer list_item_id FK
        integer variant_id FK
        boolean is_default
        integer display_order
    }

    REVIEWS {
        serial id PK
        integer product_id FK
        integer user_id FK
        integer rating "1-5"
        text comment
        boolean is_approved
        timestamp created_at
    }

    AUDIT_LOG {
        serial id PK
        integer admin_user_id FK
        text entity_type
        integer entity_id
        text action
        jsonb old_values
        jsonb new_values
        timestamp created_at
    }

    PRODUCTS ||--o{ PRODUCT_TRANSLATIONS : "has"
    PRODUCTS ||--o{ PRODUCT_VARIANTS : "has SKUs"
    PRODUCTS ||--o{ REVIEWS : "has reviews"
    PRODUCTS }o--|| CATEGORIES : "belongs to"
    PRODUCTS }o--|| BRANDS : "belongs to"
    PRODUCT_VARIANTS ||--o{ VARIANT_IMAGES : "has gallery"
    PRODUCT_VARIANTS ||--o{ VARIANT_ATTRIBUTES : "has specs"
    PRODUCT_VARIANTS ||--o{ VARIANT_SELLABLE_UOMS : "has UoMs"
    PRODUCT_VARIANTS ||--o{ VARIANT_PRICE_LISTS : "has pricing"
    PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : "purchased as"
    CATEGORIES ||--o{ CATEGORY_TRANSLATIONS : "has"
    CATEGORIES ||--o{ CATEGORIES : "parent → child"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ ADDRESSES : "has"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    AUDIT_LOG }o--|| USERS : "by admin"
    SCHOOL_LISTS ||--o{ SCHOOL_LIST_ITEMS : "defines"
    SCHOOL_LIST_ITEMS ||--o{ SCHOOL_LIST_ITEM_ALTERNATIVES : "has curated"
    SCHOOL_LIST_ITEM_ALTERNATIVES }o--|| PRODUCT_VARIANTS : "selects"
    INVENTORY_BALANCES }o--|| PRODUCT_VARIANTS : "tracks SKU"
    INVENTORY_BALANCES }o--|| WAREHOUSES : "at location"
    STOCK_MOVEMENTS }o--|| PRODUCT_VARIANTS : "audit log"
    STOCK_MOVEMENTS }o--|| WAREHOUSES : "location"
    STOCK_MOVEMENTS }o--|| USERS : "by user"
```

### Current Phase Schema & Domain Changes (Phase 1, In Progress)

To support immediate B2C operations and near-term B2B2C readiness, Phase 1 includes schema/domain updates:

1. Multi-sellable UoMs per variant (`pcs`, `pack`, `carton`)
2. Customer-group specific price lists (starting with `public_b2c`, `school_b2b`)

Phase 1 tables:

```sql
variant_sellable_uoms (
  id serial primary key,
  variant_id integer not null references product_variants(id),
  uom_code text not null,                 -- pcs/pack/carton
  factor_to_base numeric(12,4) not null, -- conversion to base_uom
  localized_label jsonb default '{}',     -- { en: "Pack", ar: "علبة" }
  barcode text,
  is_enabled boolean not null default true,
  unique (variant_id, uom_code)
);

variant_price_lists (
  id serial primary key,
  variant_id integer not null references product_variants(id),
  customer_group text not null,           -- public_b2c/school_b2b
  uom_code text not null,
  currency text not null default 'EGP',
  unit_price numeric(12,2) not null,
  min_qty integer not null default 1,
  is_sellable boolean not null default true,
  starts_at timestamp,
  ends_at timestamp,
  unique (variant_id, customer_group, uom_code, min_qty)
);

```

Domain entity changes in current phase:

| Domain Entity             | Required Change                                                         |
| ------------------------- | ----------------------------------------------------------------------- |
| `Product` / Variant model | Add `baseUom` and normalized sellable-UoM model per variant             |
| Pricing model             | Resolve price by `{ variantId, customerGroup, uom }`                    |
| `CartItem`                | Persist selected `uom` and effective `customerGroup` snapshot           |
| `OrderItem`               | Snapshot `uom`, conversion factor, and group-specific unit price        |
| Import domain/service     | Enforce deterministic upsert and explicit category/sub-category linkage |

### Nested Category Design

Categories use a **materialized path** pattern for efficient hierarchical queries:

```
┌──────────────────────────────────────────────────────────────┐
│ id │ slug            │ parent_id │ path    │ depth │ order  │
├──────────────────────────────────────────────────────────────┤
│  1 │ writing         │ NULL      │ 1       │   0   │  1     │
│  2 │ pens            │ 1         │ 1/2     │   1   │  1     │
│  3 │ ballpoint-pens  │ 2         │ 1/2/3   │   2   │  1     │
│  4 │ gel-pens        │ 2         │ 1/2/4   │   2   │  2     │
│  5 │ pencils         │ 1         │ 1/5     │   1   │  2     │
│  6 │ paper-products  │ NULL      │ 6       │   0   │  2     │
│  7 │ notebooks       │ 6         │ 6/7     │   1   │  1     │
└──────────────────────────────────────────────────────────────┘
```

**Why materialized path?**

| Operation                                   | Query Pattern                                | Performance  |
| ------------------------------------------- | -------------------------------------------- | ------------ |
| Get all children of "Pens" (id=2)           | `WHERE path LIKE '1/2/%'`                    | Fast (index) |
| Get full breadcrumb for product             | `WHERE id IN (split path)`                   | O(depth)     |
| Get root categories                         | `WHERE depth = 0 ORDER BY sort_order`        | Instant      |
| Category tree for nav menu                  | `WHERE depth <= 2 ORDER BY path, sort_order` | Single query |
| Filter products by "Writing" (+ all nested) | `JOIN categories WHERE path LIKE '1/%'`      | Single query |

This enables:

- Admin drag-drop reorder (update `sort_order`)
- Admin move category to different parent (update `parent_id`, `path`, `depth` for subtree)
- Storefront sidebar with expandable tree nav
- Product filtering across any category level

### Key Schema Design Decisions

| Decision                               | Rationale                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **`category_id` FK on products**       | Proper relational link replaces `text category` — enables JOIN filtering, cascading, referential integrity |
| **`brand_id` FK on products**          | Dedicated brands table with logo, slug — enables brand pages and brand filtering                           |
| **`path` on categories**               | Materialized path enables single-query hierarchical filtering without recursive CTEs                       |
| **`depth` on categories**              | Enables instant "get root categories" and "get N-level" queries                                            |
| **`sort_order` on categories**         | Admin-controlled display ordering, independent of name or creation date                                    |
| **`is_active` on categories/products** | Soft visibility toggle — admin can hide without deleting                                                   |
| **Snapshot fields on order_items**     | Product name, price, variant at purchase time — immune to future catalog changes                           |
| **`audit_log` table**                  | All admin mutations are tracked with old/new values — required for operations                              |
| **`addresses` table**                  | Separate from users — supports multiple saved addresses                                                    |
| **Guest checkout support**             | `user_id` nullable on orders, `guest_email` for non-registered purchases                                   |
| **`variant_sellable_uoms` table**      | Enables selling each variant in multiple units (pcs/pack/carton) without duplicating variants              |
| **`variant_price_lists` table**        | Supports per-customer-group pricing by UoM in Phase 1 pricing workflows                                    |

### Translation Strategy

| Tier                | What                        | Where                                                         | Example                     |
| ------------------- | --------------------------- | ------------------------------------------------------------- | --------------------------- |
| **Static UI text**  | Buttons, labels, navigation | `src/features/core/infrastructure/cms/messages/{locale}.json` | "Add to Cart" / "أضف للسلة" |
| **Dynamic content** | Product names, descriptions | `product_translations` / `category_translations` tables       | "Premium Pen" / "قلم ممتاز" |

Each translatable entity has a companion `_translations` table with composite PK `(entity_id, language)`.

### Phase 2–3 Schema Extensions (School Tables)

```mermaid
erDiagram
    SCHOOLS {
        serial id PK
        text name
        text slug
        text logo_url
        text accent_color
        text subscription_tier "starter/professional/enterprise"
        boolean is_active
    }

    GRADES {
        serial id PK
        integer school_id FK
        text name
        integer sort_order
    }

    SUPPLY_TEMPLATES {
        serial id PK
        integer grade_id FK
        integer teacher_id FK
        text status "draft/submitted/approved"
        text academic_year
    }

    SUPPLY_ITEM_RULES {
        serial id PK
        integer template_id FK
        integer product_id FK
        text requirement_type "required/optional"
        text brand_policy "locked/flexible"
        integer quantity
    }

    SCHOOLS ||--o{ GRADES : "has"
    GRADES ||--o{ SUPPLY_TEMPLATES : "has template"
    SUPPLY_TEMPLATES ||--o{ SUPPLY_ITEM_RULES : "defines rules"
```

Phase 2–3 will add these school-specific tables on top of the Phase 1 commerce foundation (including multi-UoM and group-pricing tables).

---

## 7. REST API

The REST API is a **Phase 1 requirement** and powers both the web dashboard and mobile app.
This section includes current contracts plus current-phase contract extensions required by the multi-UoM and admin-import workstream.

### API Architecture

```mermaid
flowchart LR
    subgraph "Clients"
        WEB["🌐 Web (SSR + CSR)"]
        MOB["📱 Mobile App"]
    end

    subgraph "Entry Points"
        SA["Server Actions<br/>(Web mutations only)"]
        API["REST API<br/>/api/v1/*"]
    end

    subgraph "Shared Backend"
        SVC["Application Services"]
        REPO["Repositories"]
        DB[("PostgreSQL")]
    end

    WEB -->|"forms/mutations"| SA --> SVC
    WEB -->|"data fetching"| API
    MOB --> API
    API --> SVC --> REPO --> DB
```

**Base URL:** `/api/v1`

### Authentication

| Method | Endpoint         | Description                                                |
| ------ | ---------------- | ---------------------------------------------------------- |
| `POST` | `/auth/guest`    | Create anonymous session + cart                            |
| `POST` | `/auth/register` | Register `{ email, password, firstName, lastName, phone }` |
| `POST` | `/auth/login`    | Login → JWT + merge guest cart                             |
| `POST` | `/auth/refresh`  | Refresh access token                                       |
| `POST` | `/auth/logout`   | Invalidate session                                         |

### Products & Catalog

| Method | Endpoint                       | Description                                                                                                                                     |
| ------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/products`                    | List with filters: `categoryId` (includes children!), `brandId`, `q`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`, optional `customerGroup` |
| `GET`  | `/products/{slug}`             | Full detail: translations, images, variants, stock, and sellable options by `{uom, customerGroup}`                                              |
| `GET`  | `/categories`                  | Full tree (hierarchical, respects `sort_order`)                                                                                                 |
| `GET`  | `/categories/{slug}`           | Single category + immediate children                                                                                                            |
| `GET`  | `/categories/{slug}/products`  | Products in category + all descendants                                                                                                          |
| `GET`  | `/brands`                      | All active brands                                                                                                                               |
| `POST` | `/products/{id}/pricing/quote` | Resolve effective price by `{ variantId, uom, customerGroup, quantity }`                                                                        |

### Cart

| Method   | Endpoint           | Description                                                   |
| -------- | ------------------ | ------------------------------------------------------------- |
| `GET`    | `/cart`            | Get cart by JWT / sessionId                                   |
| `POST`   | `/cart/items`      | Add `{ productId, quantity, variant?, uom?, customerGroup? }` |
| `PUT`    | `/cart/items/{id}` | Update quantity                                               |
| `DELETE` | `/cart/items/{id}` | Remove item                                                   |

### Checkout & Orders

| Method | Endpoint                        | Description                              |
| ------ | ------------------------------- | ---------------------------------------- |
| `POST` | `/checkout/validate`            | Validate inventory + prices + totals     |
| `POST` | `/checkout/address`             | Submit shipping address (guest-friendly) |
| `POST` | `/checkout/order`               | Create order → returns orderId           |
| `POST` | `/payments/initiate`            | Initiate payment `{ orderId, provider }` |
| `POST` | `/webhooks/payments/{provider}` | Payment provider webhook                 |
| `GET`  | `/orders`                       | Order history (authenticated)            |
| `GET`  | `/orders/{id}`                  | Order detail with items + status history |

### Admin API

| Method           | Endpoint                       | Description                                                               |
| ---------------- | ------------------------------ | ------------------------------------------------------------------------- |
| `GET/POST`       | `/admin/products`              | List / Create product                                                     |
| `GET/PUT/DELETE` | `/admin/products/{id}`         | Get / Update / Delete product                                             |
| `GET/POST`       | `/admin/categories`            | List tree / Create category                                               |
| `PUT`            | `/admin/categories/{id}`       | Update (including move in tree)                                           |
| `PUT`            | `/admin/categories/reorder`    | Batch reorder `[{ id, sortOrder }]`                                       |
| `DELETE`         | `/admin/categories/{id}`       | Delete (cascades to children)                                             |
| `GET/POST`       | `/admin/brands`                | List / Create brand                                                       |
| `PUT/DELETE`     | `/admin/brands/{id}`           | Update / Delete brand                                                     |
| `PUT`            | `/admin/inventory/{productId}` | Update stock `{ quantity }`                                               |
| `PUT`            | `/admin/inventory/bulk`        | Batch stock update                                                        |
| `GET/PUT`        | `/admin/products/{id}/uoms`    | Manage sellable UoMs per variant                                          |
| `GET/PUT`        | `/admin/products/{id}/pricing` | Manage per-customer-group price lists                                     |
| `GET`            | `/admin/orders`                | List with filters                                                         |
| `PUT`            | `/admin/orders/{id}/status`    | Update status + optional tracking #                                       |
| `GET`            | `/admin/dashboard`             | KPIs, revenue, top products, low stock                                    |
| `GET`            | `/admin/audit-log`             | Paginated audit trail                                                     |
| `POST`           | `/admin/products/bulk-import`  | Import with explicit category/sub-category linking + deterministic upsert |

### Error Format

```json
{ "errorCode": "OUT_OF_STOCK", "message": "This item is no longer available", "details": {} }
```

### Future-Proofing Headers (Reserved, No-Op in Phase 1)

```
X-Context-Type: public | school
X-School-Id: optional
X-Class-Id: optional
X-Customer-Group: public_b2c | school_b2b
```

---

## 8. Feature Matrix

### Phase 1 Feature Map

```mermaid
mindmap
  root((FindEg MVP))
    Customer Web App
      Product catalog
      Nested category browsing
      Search & filters
      Product detail + variants
      Cart drawer
      Guest checkout
      Order tracking
      Account dashboard
    Mobile App
      Shared REST API
      Same catalog & checkout
      Push notifications
      Native navigation
    Admin Dashboard
      KPI Dashboard
      Product CRUD + bulk import
      Nested category tree
      Brand management
      Media asset management
      Order lifecycle
      Inventory management
      Audit log
    Technical Foundation
      REST API layer
      i18n EN/AR + RTL
      Clean architecture
      PostgreSQL + Drizzle
      Server components
      Mobile-first design
      Dark mode
    Listo for Schools (Phase 2+)
      Deep-linked school lists
      Auto-matching rules
      Prefilled parent carts
```

### Feature Status

| Feature                            | Status         | Notes                                                         |
| ---------------------------------- | -------------- | ------------------------------------------------------------- |
| Product catalog & search           | ✅ Done        | Filters, sorting, pagination                                  |
| Product detail + variants          | ✅ Done        | Images, base pricing, variant selection                       |
| Cart (client-side + API)           | ✅ Done        | Variant-aware cart and session support                        |
| i18n (EN/AR, RTL)                  | ✅ Done        | Static + dynamic content                                      |
| Admin dashboard                    | ✅ Done        | Stats, charts, sidebar                                        |
| Admin catalog CRUD                 | ✅ Done        | Products/categories/brands                                    |
| User registration & login          | ✅ Done        | JWT cookies, bcrypt                                           |
| Customer dashboard                 | ✅ Done        | Orders and account flows                                      |
| REST API layer                     | ✅ Done        | Core `/api/v1/*` implemented for web/mobile parity            |
| Checkout flow                      | ✅ Done        | Guest/User Checkout + address management                      |
| Multi-UoM schema/domain uplift     | ✅ Done        | Variant UoMs + group pricing + order/cart snapshots           |
| Bulk import hardening              | ✅ Done        | Deterministic upsert + explicit category/sub-category linking |
| School prefilled-cart flow (Listo) | 🟡 In Progress | Schema implemented, FE scaffolding begun                      |
| Payment Integration (Paymob)       | 🟡 Partial     | Webhook handlers implemented, UI pending                      |
| Substitution/approval policies     | ⬜ Planned     | Phase 2 policy engine                                         |
| School co-brand overlays           | ⬜ Planned     | Phase 2 UX layer                                              |
| Mobile app app-shell               | ⬜ Planned     | React Native client on shared API                             |
| Automated testing                  | ⬜ Planned     | Unit + integration                                            |
| CI/CD pipeline                     | ⬜ Planned     | Automated deploy + checks                                     |

---

## 9. Non-Functional Requirements

### Performance Targets

| Metric                      | Target                      |
| --------------------------- | --------------------------- |
| API P50 / P95 / P99 latency | < 120ms / < 300ms / < 700ms |
| Homepage LCP                | < 2.5s                      |
| Product Page LCP            | < 2.5s                      |
| Category tree query         | < 50ms                      |
| Cart operations             | < 200ms                     |
| Checkout validation         | < 500ms                     |
| Mobile app cold start       | < 3s                        |

### Scalability

| Scenario              | Concurrent Users |
| --------------------- | ---------------- |
| Normal                | 100–500          |
| Peak (Back to School) | 5,000–20,000     |

Horizontal scaling, stateless backend, CDN for assets, read replica ready.

### Security

| Concern   | Approach                                  |
| --------- | ----------------------------------------- |
| Auth      | JWT (short expiry) + refresh rotation     |
| Passwords | bcrypt hashing                            |
| Transport | HTTPS everywhere                          |
| Cards     | Provider tokenization only                |
| Mobile    | Certificate pinning, secure token storage |
| OWASP     | SQL injection, XSS, CSRF protection       |
| Admin     | Role-based access control, audit logging  |

### Availability

| Component                 | SLA                     |
| ------------------------- | ----------------------- |
| Storefront (web + mobile) | 99.9%                   |
| Checkout & Payments       | 99.95%                  |
| Admin Dashboard           | 99.5%                   |
| RPO                       | 15 min                  |
| RTO                       | 1 hour                  |
| Backups                   | Daily, 30-day retention |

### SEO & Accessibility

- Server-side rendering (Next.js)
- Structured data (JSON-LD)
- Semantic HTML5
- High contrast + screen reader labels
- Touch targets ≥ 44×44px
- Category pages with SEO-friendly nested URLs

---

## 10. Project Structure

```
findeg.stationary/
├── src/
│   ├── app/[locale]/           # Routes & pages
│   │   ├── (shop)/             # Public storefront
│   │   ├── (admin)/admin/      # Admin dashboard
│   │   ├── (dashboard)/        # Customer dashboard
│   │   ├── (auth)/             # Login & registration
│   │   └── api/v1/             # REST API routes (for mobile + external)
│   ├── domain/entities/        # Product, Cart, Category, User, Order, Review
│   ├── application/
│   │   ├── services/           # Auth, Product, Cart, Category, Admin*, Order
│   │   ├── services/interfaces/# All service contracts
│   │   ├── repositories/       # All repository contracts
│   │   └── actions/            # Server Actions (web mutations)
│   ├── infrastructure/
│   │   ├── database/schema/    # Drizzle schema definitions
│   │   ├── repositories/       # Drizzle repository implementations
│   │   ├── di/                 # ServiceContainer (singleton DI)
│   │   ├── auth/               # CookieSessionProvider (JWT)
│   │   └── cms/                # Static translation messages
│   ├── components/             # common/ · layout/ · ui/
│   ├── hooks/                  # useCart, useProducts, useUser, useTheme
│   ├── providers/              # CartProvider, UserProvider, ThemeProvider
│   └── i18n/                   # Routing, request config, navigation
├── scripts/                    # Dev, DB, seeding scripts
├── docs/                       # Guides, DB docs, onboarding
├── docker-compose.yml          # PostgreSQL dev container
└── package.json
```

### Key Commands

| Command             | Purpose                                 |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start dev server (auto-kills port 3000) |
| `npm run db:setup`  | Start DB + push schema + seed data      |
| `npm run db:studio` | Visual database browser                 |
| `npm run lint`      | Type-check + ESLint                     |

---

## 11. Success Metrics

| Metric                                   | Target       | Phase |
| ---------------------------------------- | ------------ | ----- |
| Checkout completion rate                 | > 60%        | 1     |
| Mobile vs web conversion                 | Parity ± 10% | 1     |
| Product creation time (admin)            | < 5 min      | 1     |
| Order processing time (admin)            | < 2 min      | 1     |
| Category tree query time                 | < 50ms       | 1     |
| Bulk import success rate                 | > 99% rows   | 1     |
| Import rows with valid sub-category link | > 98% rows   | 1     |
| UoM pricing resolution errors            | < 0.1% req   | 1     |
| Time to create supply list               | < 10 min     | 2     |
| School reuse rate next year              | > 80%        | 3     |

---

## 12. Schema + DDD Redesign Program (Catalog + Identity)

This section defines the approved target model for the in-progress internal refactor.

### 12.1 Catalog Model Targets

- Localized content is modeled as locale-keyed objects across product/category/brand names, descriptions, and slugs.
- Pricing persistence is split into:
  - persisted `pricing` data (base/cost/wholesale and channel-aware contexts),
  - persisted `discountRules`,
  - computed `resolvedPricing` runtime output.
- `strikePrice` is computed from discount rules and not persisted.
- Media is modeled for multiple display contexts (for example grid, PDP, zoom).

### 12.2 Identity and Access Targets

- User profile (`users`) is separate from authentication credentials and linked accounts.
- Identity supports multiple linked auth providers per user.
- Passwords are persisted as hashes only, with strategy metadata.
- Authorization is permission-based:
  - roles map to permissions,
  - users and organization memberships map to roles,
  - checks enforce permissions, not role strings.
- Guest users are represented by persisted guest principals for cart/checkout continuity.

### 12.3 Organization and Business Access Targets

- Organizations are first-class entities for business context.
- Memberships scope user access per organization.
- Session payload includes scoped role IDs and actor metadata.

### 12.4 Contract Boundaries

- Domain types are the source of truth for application and infrastructure contracts.
- Mapping layers should be minimized; only keep adapters at true boundary seams.
- Locale and pricing types must remain consistent from domain to persistence schemas.

### 12.5 Governance

- Execution tracker: `project-planning/SCHEMA_DDD_REFACTOR_TASKS.md`.
- Architecture release timeline: `docs/architecture/RELEASE_NOTES.md`.
- Changelog remains git-history generated (`npm run changelog`), with release notes as curated architecture milestones.

---

_End of System Specification_

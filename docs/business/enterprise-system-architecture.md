# Enterprise System Architecture

As of 2026-10-12 · Clarity: **Enterprise Architectural Blueprint**

This document provides the macro-level architectural views and structural models for FindEg, establishing standard enterprise blueprints across business capabilities, system layers, bounded contexts, and governance frameworks.

---

## 1. System & Ecosystem Context (C4 Level 1)

FindEg operates a dual-engine retail and B2B2C ecosystem in Egypt: a core direct-to-consumer (B2C) stationery and gifts e-commerce platform, and a B2B2C Partner Program with schools as the foundation.

```mermaid
flowchart TB
    subgraph ExternalActors["External Human Actors"]
        Customer["Customer / Family<br/>(Guest or Registered Account)"]
        SchoolAdmin["Partner School Administrator<br/>(Principal / Secretary)"]
        SchoolViewer["Partner Report Viewer<br/>(School Bursar / Finance)"]
    end

    subgraph InternalActors["Internal Human Actors"]
        StaffAdmin["FindEg System Administrator"]
        StaffEditor["FindEg Catalog & Content Editor"]
        StaffOps["FindEg Operations & Fulfillment"]
        Courier["Logistics Courier / Delivery Agent"]
    end

    subgraph FindEgPlatform["FindEg Core Enterprise System"]
        StorefrontApp["Storefront Application<br/>(B2C Web & Public School Lists)"]
        PartnerWorkspace["Partner Workspace<br/>(/[locale]/partner/[code])"]
        DashboardApp["Operations Dashboard<br/>(Staff Administration)"]
        AppCore["FindEg Application Engine<br/>(Clean Architecture Core)"]
        Database[("PostgreSQL Database<br/>(Entities, Relational Data & Outbox)")]
    end

    subgraph ExternalServices["External Infrastructure & Services"]
        EmailService["Transactional Email Service<br/>(SMTP / Resend / Outbox Delivery)"]
        StorageService["Media Storage<br/>(Product Photos & School Logos)"]
    end

    Customer -->|Browses catalog, adds to cart, fills school lists, orders COD| StorefrontApp
    SchoolAdmin -->|Manages school memberships, invites staff| PartnerWorkspace
    SchoolViewer -->|Reads monthly anonymized sales reports| PartnerWorkspace

    StaffAdmin -->|Manages staff roles, partners & system settings| DashboardApp
    StaffEditor -->|Uploads catalog, authors school supply lists| DashboardApp
    StaffOps -->|Phones COD customers, oversees picking, pack & dispatch| DashboardApp
    Courier -->|Delivers parcels, collects COD cash, returns undelivered| StaffOps

    StorefrontApp -->|Server Actions & API Routes| AppCore
    PartnerWorkspace -->|Server Actions & API Routes| AppCore
    DashboardApp -->|Server Actions & API Routes| AppCore

    AppCore -->|Drizzle ORM transactional queries| Database
    AppCore -->|Enqueues messages in outbox transaction| Database
    Database -.->|Outbox Poller / Worker| EmailService
    AppCore -->|Uploads / retrieves assets| StorageService

    EmailService -.->|Delivers order confirmations, OTPs, invites| Customer
    EmailService -.->|Sends member invitations| SchoolAdmin
```

---

## 2. Multi-Tier Layered System Architecture

FindEg is built upon strict **Clean Architecture** and package boundaries. Dependencies flow strictly inwards toward the Domain Core.

```mermaid
flowchart TB
    subgraph LayerPresentation["1. Presentation & UI Layer (Next.js Apps)"]
        direction LR
        UI_Storefront["Storefront Web UI<br/>(Public Catalog, Cart, List Selection)"]
        UI_Partner["Partner Workspace UI<br/>(Memberships, Anonymized Reports)"]
        UI_Dashboard["Staff Dashboard UI<br/>(Catalog Upload, List Editor, Order Ops)"]
    end

    subgraph LayerDelivery["2. Delivery & Gateway Layer (Server Actions & Route Handlers)"]
        direction LR
        Gateway_Actions["Next.js Server Actions<br/>(Mutations, Forms, Security Boundaries)"]
        Gateway_Routes["Route Handlers / API<br/>(Health, Webhooks, Public Lookups)"]
        Gateway_Guards["Permission & Auth Guards<br/>(IPermissionService, Session Resolvers)"]
    end

    subgraph LayerApplication["3. Application Core Layer (Use Cases & Orchestration)"]
        direction TB
        App_Catalog["CatalogService<br/>(Products, Variants, Categories, Search)"]
        App_Quoting["QuotingEngine<br/>(Price Calculation, List Offers, Confirmations)"]
        App_Checkout["CheckoutService<br/>(Order Acceptance, Idempotency, Reservations)"]
        App_Fulfillment["OrderFulfillmentService<br/>(Phone Confirmation, Status Transitions)"]
        App_SupplyList["SchoolSupplyListService<br/>(Specifications, Alternatives, Slot Lifecycle)"]
        App_Partner["PartnerMembershipService<br/>(Invitations, Workspaces, RBAC)"]
        App_Reporting["PartnerReportingService<br/>(Monthly Aggregation, k-Anonymity)"]
    end

    subgraph LayerDomain["4. Domain Model & Invariants Layer (@findeg/schema & Entities)"]
        direction TB
        Domain_Schema["@findeg/schema Package<br/>(Canonical Enums, Invariants, Transition Tables)"]
        Domain_Rules["Business Invariants<br/>(Exact Piasters, SL-*, CO-*, PA-*, ID-*, CA-*)"]
        Domain_Contracts["Ports & Repository Interfaces<br/>(IProductRepo, IOrderRepo, IPartnerRepo)"]
    end

    subgraph LayerInfrastructure["5. Infrastructure & Persistence Adapters"]
        direction LR
        Infra_Drizzle["Drizzle ORM & Postgres<br/>(Schema Tables, Relations, Transactions)"]
        Infra_Outbox["Transactional Outbox Worker<br/>(Guaranteed At-Least-Once Delivery)"]
        Infra_Mailer["Mailer Adapter<br/>(Email Rendering & SMTP Delivery)"]
        Infra_Media["Media Library Storage<br/>(Image Assets & CDN Caching)"]
    end

    LayerPresentation --> LayerDelivery
    LayerDelivery --> LayerApplication
    LayerApplication --> LayerDomain
    LayerInfrastructure -.->|Implements Ports & Contracts| LayerDomain
    LayerApplication --> LayerInfrastructure
```

---

## 3. Business Capability Model

Functional decomposition of FindEg's business capabilities into Level 1 and Level 2 domains.

```mermaid
flowchart TD
    subgraph Enterprise["FindEg Enterprise Capabilities"]
        subgraph Cap_Merchandising["1. Merchandising & Catalog"]
            C1_1["1.1 Product & Variant Management (SKU, Attributes, Pricing)"]
            C1_2["1.2 Taxonomy & Navigation (Categories, Brands, Tags)"]
            C1_3["1.3 Bulk Catalog Ingestion (Spreadsheet Import Engine)"]
            C1_4["1.4 Merchandising Curation (Home Banners, Collections)"]
            C1_5["1.5 Customer Feedback (Product Reviews & Ratings)"]
        end

        subgraph Cap_School["2. School Partner Service Engine"]
            C2_1["2.1 Partner School Profiles (Governorate, Type, System)"]
            C2_2["2.2 School Supply List Curation (Draft, Exact Items, Specs)"]
            C2_3["2.3 Dynamic Alternative Matching Engine (Runtime Resolution)"]
            C2_4["2.4 Slot & Replacement Versioning (Single Published List per Slot)"]
            C2_5["2.5 Advisory Completeness Evaluation (Required Items & Quantities)"]
        end

        subgraph Cap_Commerce["3. Sales & Commerce Operations"]
            C3_1["3.1 Shopping Cart Management (B2C Catalog items)"]
            C3_2["3.2 List Selection Management (Isolated List Choices)"]
            C3_3["3.3 Dynamic Quoting & Confirmation (Price Fingerprinting)"]
            C3_4["3.4 Promotional Pricing (List Offers % Discounts)"]
            C3_5["3.5 Atomic Order Acceptance (COD, Idempotency, Frozen Snapshots)"]
        end

        subgraph Cap_Fulfillment["4. Fulfillment & Inventory Operations"]
            C4_1["4.1 Multi-warehouse Stock Reservation & Allocation"]
            C4_2["4.2 Order Verification (Phone Confirmation Workflow)"]
            C4_3["4.3 Warehouse Pick, Pack & Dispatch Management"]
            C4_4["4.4 Courier Delivery & Cash on Delivery Collection"]
            C4_5["4.5 Cancellations, Undelivered Returns & Restocking"]
        end

        subgraph Cap_PartnerMgmt["5. Partner Governance & Privacy"]
            C5_1["5.1 Partner Lifecycle (Onboarding, Active, Suspended, Closed)"]
            C5_2["5.2 Member Invitations & Role-Based Access Control"]
            C5_3["5.3 Attributed Order Auditing (School Sales Attribution)"]
            C5_4["5.4 Anonymized Monthly Reporting (k-Anonymity Folding <3 Orders)"]
        end

        subgraph Cap_Identity["6. Identity, Security & Audit"]
            C6_1["6.1 Customer Accounts & Address Book"]
            C6_2["6.2 Guest Order Access (Order Ref + Email + OTP Token)"]
            C6_3["6.3 Staff RBAC (Admin, Catalog Editor, Operations)"]
            C6_4["6.4 Transactional Audit Logging (Staff Orders & Partner Changes)"]
            C6_5["6.5 Outbox Reliable Event Dispatch"]
        end
    end
```

---

## 4. Domain-Driven Design (DDD) Bounded Context Map

Relationships and boundaries between FindEg's 7 core bounded contexts. Following **ADR-0016**, all cross-boundary relationships are linked strictly by identifiers (`id` or `orderReference`), never by object references.

```mermaid
flowchart LR
    subgraph BC_Catalog["Catalog Bounded Context"]
        ProductVariant["ProductVariant<br/>(SKU, price in piasters, attributes)"]
        Product["Product"]
        Category["Category (Tree)"]
    end

    subgraph BC_School["School Supply List Context"]
        SchoolSupplyList["SchoolSupplyList<br/>(Draft/Published/Archived)"]
        SchoolSupplyListItem["SchoolSupplyListItem<br/>(ExactItem | Specification)"]
        ListSelection["ListSelection<br/>(Client in-progress choices)"]
    end

    subgraph BC_Partner["Business Partner Context"]
        BusinessPartner["BusinessPartner<br/>(Onboarding/Active/Suspended/Closed)"]
        PartnerSchoolProfile["PartnerSchoolProfile<br/>(Governorate, system, logo)"]
        PartnerMembership["PartnerMembership<br/>(Active/Suspended/Ended)"]
        PartnerReport["PartnerReport<br/>(Aggregated monthly totals)"]
    end

    subgraph BC_Sales["Sales & Orders Context"]
        Order["Order<br/>(Reference: FE-xxxxxx)"]
        OrderLine["OrderLine<br/>(Frozen SKU, name, price)"]
        ListOffer["ListOffer<br/>(% discount on list)"]
        AttributedOrder["AttributedOrder<br/>(Immutable school link)"]
        GuestOrderAccess["GuestOrderAccess<br/>(15-min OTP token)"]
    end

    subgraph BC_Customer["Customer & Identity Context"]
        Customer["Customer<br/>(Account profile, addresses)"]
        StaffAccount["Staff Account<br/>(Staff Roles & Permissions)"]
    end

    subgraph BC_Inventory["Inventory Bounded Context"]
        StockReservation["StockReservation<br/>(Units held per warehouse)"]
        Warehouse["Warehouse"]
    end

    subgraph BC_System["System & Outbox Context"]
        OutboxMessage["OutboxMessage<br/>(Pending/Sent/Failed events)"]
    end

    BC_School -- "references variantId" --> BC_Catalog
    BC_School -- "references businessPartnerId" --> BC_Partner

    BC_Sales -- "references customerId" --> BC_Customer
    BC_Sales -- "references variantId" --> BC_Catalog
    BC_Sales -- "references supplyListId" --> BC_School
    BC_Sales -- "references businessPartnerId" --> BC_Partner

    BC_Inventory -- "references orderId" --> BC_Sales
    BC_Inventory -- "references variantId" --> BC_Catalog

    BC_Partner -- "references customerId" --> BC_Customer
    BC_System -- "payload.orderId" --> BC_Sales
```

---

## 5. Unified Enterprise State Coordination Engine

A critical enterprise architectural invariant at FindEg is the strict coordination between **Order Status**, **Payment Status**, and **Stock Reservation Lifecycle**.

```mermaid
stateDiagram-v2
    direction TB

    state "Order Lifecycle" as OL {
        [*] --> Pending: Order Acceptance
        note right of Pending: Stock is RESERVED\nPayment is UNPAID\nAttribution is FROZEN
        
        Pending --> Confirmed: Staff phones Customer\nCustomer confirms COD
        Pending --> Cancelled: Customer unreachable / cancelled
        
        Confirmed --> Processing: Warehouse pick & pack
        Confirmed --> Cancelled: Cancelled before dispatch
        
        Processing --> Shipped: Handed to Courier
        Processing --> Cancelled: Cancelled before dispatch
        
        Shipped --> Delivered: Courier collected cash
        note right of Delivered: Stock is CONSUMED\nPayment is marked PAID
        
        Shipped --> Cancelled: Parcel back in warehouse
        note right of Cancelled: Stock is RELEASED\nPayment stays UNPAID
        
        Delivered --> Refunded: Post-delivery return approved
        note right of Refunded: Stock unchanged\n(restocked manually)\nPayment is REFUNDED
        
        Cancelled --> [*]
        Refunded --> [*]
    }

    state "State Sync Invariants" as SI {
        state "Pending: Unpaid + Stock Reserved" as S1
        state "Confirmed: Unpaid + Stock Reserved" as S2
        state "Processing: Unpaid + Stock Reserved" as S3
        state "Shipped: Unpaid + Stock Reserved" as S4
        state "Delivered: Paid + Stock Consumed" as S5
        state "Cancelled: Unpaid + Stock Released" as S6
        state "Refunded: Refunded + Stock Unchanged" as S7
    }
```

---

## 6. Enterprise Security & Role-Based Access Control (RBAC) Matrix

FindEg enforces absolute separation between Customer Accounts, Staff Dashboard Roles, and Partner Workspace Roles (**ID-1**, **ID-2**, **PA-4**).

| Access Domain | Identity / Role | Accessible Surface | Primary Capabilities & Boundaries |
|---|---|---|---|
| **Public** | Guest (No Account) | Storefront | Browse catalog, build Cart/List Selection, checkout COD, look up order via `GuestOrderAccess` OTP. |
| **Customer** | Signed-in Customer | Storefront (`/account`) | Manage profile, view personal order history, save addresses. Has **no** access to Staff dashboard or Partner Workspaces without distinct role assignment. |
| **Partner** | `partner-administrator` | Partner Workspace (`/partner/[code]`) | Invite members (7-day link), manage member roles, suspend/reactivate members, read monthly `PartnerReport`. Always at least 1 per partner. |
| **Partner** | `report-viewer` | Partner Workspace (`/partner/[code]`) | Read-only access to anonymized monthly `PartnerReport` (k-anonymity applied). Cannot manage members. |
| **Partner** | `list-manager` / `collection-staff` | Partner Workspace (`/partner/[code]`) | Granted roles reserved for future partner self-service; grant no operational privileges today. |
| **Staff** | `Administrator` | Dashboard (`/dashboard`) | Full access: manage Staff accounts, grant Staff roles, create & onboard Business Partners, view audit logs. |
| **Staff** | `Catalog & Content Editor` | Dashboard (`/dashboard`) | Manage products, variants, prices, images, categories, brands, tags, Home Banners, Content Pages, School Supply Lists. |
| **Staff** | `Operations` | Dashboard (`/dashboard`) | View orders, perform COD phone confirmation, move orders through fulfillment (`processing`, `shipped`, `delivered`), cancel orders, trigger refunds, adjust inventory. |

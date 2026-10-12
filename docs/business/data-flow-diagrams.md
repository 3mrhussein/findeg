# Enterprise Data Flow Diagrams (DFD)

As of 2026-10-12 · Clarity: **Enterprise Information Architecture & Data Flows**

This document details the data transformations, persistent storage interactions, and external data exchanges across FindEg using standard Data Flow Diagram conventions (Level 0 Context and Level 1 Sub-Systems).

---

## 1. DFD Level 0: Macro Context Data Flow

The macro-level boundary between external entities and FindEg's platform data stores.

```mermaid
flowchart TB
    subgraph Entities["External Entities"]
        E_Customer["Customer / Family"]
        E_School["Partner School Staff"]
        E_Ops["FindEg Operations Staff"]
        E_Courier["Logistics Courier"]
        E_Email["External Email Gateway"]
    end

    subgraph Process["Core Enterprise System"]
        P_FindEg(("0. FindEg Platform<br/>Core Processing Engine"))
    end

    subgraph Stores["Core Data Stores"]
        D_Catalog[("D1: Catalog & Content")]
        D_Partners[("D2: Business Partners & Schools")]
        D_Lists[("D3: School Supply Lists")]
        D_Orders[("D4: Orders & Order Lines")]
        D_Inventory[("D5: Warehouses & Stock")]
        D_Identity[("D6: Accounts & Access History")]
        D_Outbox[("D7: Transactional Outbox")]
    end

    E_Customer -->|Search queries, cart items, list selections, COD orders| P_FindEg
    P_FindEg -->|Product catalog, live quotes, OTP codes, order confirmations| E_Customer

    E_School -->|School details, member invite acceptance, report queries| P_FindEg
    P_FindEg -->|Invitations, workspace views, anonymized monthly reports| E_School

    E_Ops -->|Catalog spreadsheets, list curation, phone confirmations, stock adjustments| P_FindEg
    P_FindEg -->|Pending order queues, dispatch waybills, audit logs| E_Ops

    E_Courier -->|Delivery confirmation, collected COD cash, undelivered parcels| P_FindEg
    P_FindEg -->|Shipping labels, package manifests, customer address & phone| E_Courier

    P_FindEg -->|Dispatched transactional emails: order confirmations, OTPs, invites| E_Email

    P_FindEg <-->|Read / Write| D_Catalog
    P_FindEg <-->|Read / Write| D_Partners
    P_FindEg <-->|Read / Write| D_Lists
    P_FindEg <-->|Read / Write| D_Orders
    P_FindEg <-->|Read / Write| D_Inventory
    P_FindEg <-->|Read / Write| D_Identity
    P_FindEg <-->|Enqueue / Dequeue| D_Outbox
```

---

## 2. DFD Level 1 Sub-System Diagrams

### 2.1. DFD Level 1: Catalog & Merchandising Ingestion

Data flow for product catalog creation, validation, media linking, and storefront search/browse indexing.

```mermaid
flowchart LR
    Staff["Catalog & Content Editor"] -->|Spreadsheet / Manual Entry| P1_1["1.1 Ingestion & Schema Validation"]
    P1_1 -->|Valid bilingual data, SKUs & Piaster prices| P1_2["1.2 Product & Variant Creator"]
    P1_1 -->|Validation errors| Staff

    MediaService["Media Library"] -->|Image URLs & CDN keys| P1_2
    P1_2 -->|Write Products & Variants| D_Catalog[("D1: Catalog Store<br/>(Products, Variants, Categories, Attributes, Tags)")]

    D_Catalog -->|Read categories & tags| P1_3["1.3 Taxonomy & Hierarchy Engine"]
    P1_3 -->|Build Category Tree & Tag Groups| P1_4["1.4 Merchandising & Collection Builder"]
    Staff -->|Home Banners & Featured Collections| P1_4

    P1_4 -->|Published Storefront Index| D_SearchIndex[("D1.1: Storefront Search & Filter Cache")]
    Customer["Storefront Customer"] -->|Search keywords & attribute filters| P1_5["1.5 Discovery & Browse Engine"]
    D_SearchIndex -->|Query matches| P1_5
    P1_5 -->|Product listings, variants, prices| Customer

    Customer -->|Submit review & rating| P1_6["1.6 Review Processor"]
    P1_6 -->|Write verified review & recalc ratings| D_Catalog
```

---

### 2.2. DFD Level 1: Dynamic Quoting, Order Acceptance & Inventory Reservation

The transactional data flow from Cart/List Selection to an accepted Order with immutable attribution and held inventory.

```mermaid
flowchart TD
    Customer["Customer Device"] -->|Cart lines OR List Selection lines| P2_1["2.1 Dynamic Quoting Engine"]
    D_Catalog[("D1: Catalog Store")] -->|Live variant prices in piasters| P2_1
    D_Lists[("D3: School Supply Lists")] -->|Active List Offer % discount| P2_1

    P2_1 -->|Generate server-authoritative Quote & Confirmation Digest| Customer
    Customer -->|Submit Order: Confirmation Digest + COD + Address + IdempotencyKey| P2_2["2.2 Idempotency & Digest Verifier"]

    P2_2 -->|Fresh quote re-computed| P2_3{Digest Matches?}
    P2_3 -->|No: Price/Offer Changed| RejectQuote[Return Price Change Reconfirmation Request] --> Customer
    P2_3 -->|Yes: Verified| P2_4["2.3 Stock Availability Assessor"]

    D_Inventory[("D5: Inventory Store")] -->|Check warehouse on-hand stock| P2_4
    P2_4 -->|Insufficient Stock| RejectStock[Reject Entire Order CO-4] --> Customer

    P2_4 -->|Stock Sufficient| P2_5["2.4 Atomic Order Acceptance Transaction"]
    P2_5 -->|Insert Order: Status=Pending, Payment=Unpaid| D_Orders[("D4: Orders Store")]
    P2_5 -->|Insert OrderLines: Frozen names, SKUs, piaster prices| D_Orders
    P2_5 -->|Insert AttributedOrder: Partner & List linkage| D_Orders
    P2_5 -->|Recheck available stock under row locks; insert StockReservation| D_Inventory
    P2_5 -->|Insert OutboxMessage: Order Confirmation Email| D_Outbox[("D7: Outbox Store")]

    P2_5 -->|Return FE-xxxxxx Order Reference| Customer
```

---

### 2.3. DFD Level 1: School Supply List Dynamic Matching & Alternative Resolution

The runtime evaluation pipeline that matches live catalog variants against school specifications.

```mermaid
flowchart TB
    PartnerSchool["Partner School Profile"] -->|Academic Year, Grade, Governorate| P3_1["3.1 List Slot Allocator"]
    Staff["Catalog Editor"] -->|Draft items: Exact items vs. Specifications| P3_2["3.2 List Specification Compiler"]
    P3_1 --> P3_2

    P3_2 -->|Freeze specifications on Publish| D_Lists[("D3: School Supply Lists Store<br/>(Lists, Items, Specifications)")]
    D_Lists -->|Generate Public Code| PublicCodeLink[Public Code URL]

    Family["Family / Customer"] -->|Public Code| P3_3["3.3 List Resolution & Projection"]
    D_Lists -->|Retrieve List & Frozen Specifications| P3_3
    P3_3 -->|Render List Items| Family

    Family -->|Request Alternatives for Item Line| P3_4["3.4 Dynamic Matching Engine"]
    D_Lists -->|Read item Category & Attribute requirements| P3_4
    D_Catalog[("D1: Catalog Store")] -->|Query active variants in matching category| P3_4

    P3_4 -->|Filter variants matching ALL specified attributes SL-8| P3_5["3.5 Price Delta & Metadata Calculator"]
    P3_5 -->|Return Allowed Alternatives with live prices & deltas| Family

    Family -->|Select Variant & Prescribed Quantity| P3_6["3.6 List Selection Manager"]
    P3_6 -->|Evaluate Required Items coverage| P3_7["3.7 Advisory Completeness Evaluator"]
    P3_7 -->|Return Completeness status & Selection State| Family
```

---

### 2.4. DFD Level 1: Operations, Fulfillment & Cash Settlement

How orders move through physical picking, phone confirmation, courier dispatch, and COD reconciliation.

```mermaid
flowchart LR
    D_Orders[("D4: Orders Store")] -->|Orders with status Pending| P4_1["4.1 Ops Order Queue"]
    Ops["Operations Staff"] -->|Review Order details & phone number| P4_1
    P4_1 -->|Initiate Phone Call to Customer| Customer["Customer"]

    Customer -->|Confirms COD purchase| Ops
    Ops -->|Mark Confirmed CO-18| P4_2["4.2 Order Confirmation Handler"]
    P4_2 -->|Update Order Status to Confirmed| D_Orders

    P4_2 -->|Move to Processing| P4_3["4.3 Warehouse Pick & Pack Engine"]
    D_Inventory[("D5: Inventory Store")] -->|Read reserved units & warehouse location| P4_3
    P4_3 -->|Generate Picking Sheet & Parcel Waybill| Courier["Logistics Courier"]

    P4_3 -->|Update Order Status to Shipped| D_Orders
    D_Orders -->|Enqueue Shipped Email| D_Outbox[("D7: Outbox Store")]

    Courier -->|Deliver Parcel & Collect Cash| Customer
    Courier -->|Delivery Receipt & Remitted Cash| P4_4["4.4 Delivery & Reconciliation Service"]

    P4_4 -->|Update Order Status to Delivered| D_Orders
    P4_4 -->|Update Payment Status to Paid| D_Orders
    P4_4 -->|Consume Stock: Deduct units permanently| D_Inventory
    P4_4 -->|Enqueue Delivered Email| D_Outbox
```

---

### 2.5. DFD Level 1: Privacy-Preserving Partner Reporting Pipeline

The aggregation pipeline that calculates monthly sales totals for school bursars while strictly preventing individual customer or order re-identification.

```mermaid
flowchart TB
    SchoolBursar["Partner Report Viewer"] -->|Select Month & Year in Cairo Time| P5_1["5.1 Report Query Dispatcher"]
    D_Identity[("D6: Access Store")] -->|Verify active report-viewer or admin membership| P5_1

    P5_1 -->|Fetch matching records| P5_2["5.2 Attributed Order Filter"]
    D_Orders[("D4: Orders Store<br/>(Attributed Orders & Lines)")] -->|Attributed Orders for Partner School| P5_2

    P5_2 -->|Exclude Cancelled and Refunded Orders PA-14| P5_3["5.3 Temporal Aggregation Engine"]
    P5_3 -->|Group sales by List Item & Product Variant| P5_4["5.4 k-Anonymity Evaluator"]

    P5_4 -->|Line built from >= 3 distinct Orders| P5_5["5.5 Standard Row Formatter"]
    P5_4 -->|Line built from < 3 distinct Orders| P5_6["5.6 Privacy Fold Engine"]

    P5_5 -->|Item name, variant name, units sold, total EGP| P5_7["5.7 Monthly Partner Report Builder"]
    P5_6 -->|Fold into 'Other Items' aggregate row| P5_7

    P5_7 -->|Render Anonymized Partner Report| SchoolBursar
    P5_7 -.->|Privacy Control: No customer names, no order references, no order counts| PrivacyAudit[Bounded Re-identification Mitigation]
```

---

### 2.6. DFD Level 1: Transactional Outbox & Notification Pipeline

The reliable communication pipeline ensuring transactional integrity between database mutations and asynchronous email delivery.

```mermaid
flowchart LR
    DomainServices["Domain Services<br/>(Checkout, Fulfillment, Memberships)"] -->|Write Entity Mutation + OutboxMessage in SAME Transaction| DB_Tx["PostgreSQL Transaction Block"]

    DB_Tx -->|Commit Entity Data| D_Entities[("Domain Entity Tables")]
    DB_Tx -->|Commit Outbox Row: Status=Pending, Retries=0| D_Outbox[("D7: OutboxMessage Store")]

    OutboxWorker["Outbox Background Poller / Worker"] -->|Poll for Pending Messages with lock| D_Outbox
    OutboxWorker -->|Parse Message Payload & Template| P6_1["6.1 Email Renderer"]
    P6_1 -->|Compiled HTML & Text Email| P6_2["6.2 SMTP / Mailer Adapter"]

    P6_2 -->|Send Email via API / SMTP| ExternalGateway["External Email Gateway"]
    ExternalGateway -->|200 OK Accepted| P6_3["6.3 Delivery Auditor"]
    ExternalGateway -->|Error / Timeout| P6_4["6.4 Exponential Backoff Retrier"]

    P6_3 -->|Update OutboxMessage: Status=Sent, SentAt=Now| D_Outbox
    P6_4 -->|Increment retry count; Status=Failed if max attempts reached| D_Outbox

    ExternalGateway -->|Deliver Email| Recipient["Customer / Partner / Staff"]
```

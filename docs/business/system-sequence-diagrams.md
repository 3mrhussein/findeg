# Technical & Business Sequence Diagrams

As of 2026-10-12 · Clarity: **Enterprise Multi-Tier Interaction Specifications**

This document details the exact multi-tier runtime interaction flows across the FindEg system. Each sequence diagram models the end-to-end communication between the **Actor**, **UI Client Component**, **Next.js Server Action / API Route**, **Application Service Layer**, **Domain Ports & Invariants**, **PostgreSQL Database Transaction (Drizzle)**, **Transactional Outbox**, and **External Gateways**.

---

## 1. Catalog & Merchandising Ingestion

### SEQ-1: Catalog Bulk Spreadsheet Ingestion Pipeline

How catalog editors upload bulk spreadsheets, validate data integrity against business rules, and commit products atomically.

```mermaid
sequenceDiagram
    autonumber
    actor Editor as Catalog Editor (Staff)
    participant UI as Dashboard Importer UI<br/>(BulkImportDropzone)
    participant ServerAction as Server Action<br/>(importCatalogAction)
    participant ImportService as CatalogImportService
    participant Validator as SpreadsheetValidator
    participant CatalogRepo as ProductRepository
    participant DB as PostgreSQL (Drizzle)
    participant Cache as Cache / Search Index

    Editor->>UI: Select and drop .xlsx / .csv spreadsheet
    UI->>ServerAction: Submit file FormData (multipart)
    ServerAction->>ImportService: processSpreadsheet(buffer, filename)
    ImportService->>Validator: parseAndValidateRows(rows)

    loop For every row in spreadsheet
        Validator->>Validator: Check SKU format & uniqueness (CA-2)
        Validator->>Validator: Verify Category exists in hierarchy
        Validator->>Validator: Validate Price in positive integer piasters (CA-3)
        Validator->>Validator: Validate Bilingual names & descriptions (CA-5)
    end

    alt Validation Errors Found in Any Row
        Validator-->>ImportService: Return validation failure list with row numbers
        ImportService-->>ServerAction: Rejection report (All-or-nothing: entire file rejected)
        ServerAction-->>UI: 422 Unprocessable: Detailed row-by-row error report
        UI-->>Editor: Render error list (No rows committed)
    else All Rows Valid
        Validator-->>ImportService: Validated DTO batch
        ImportService->>DB: Begin Database Transaction
        activate DB
        ImportService->>CatalogRepo: upsertProductsAndVariants(batch)
        CatalogRepo->>DB: INSERT / UPDATE products & product_variants
        ImportService->>DB: Commit Transaction
        deactivate DB

        ImportService->>Cache: revalidateTag('catalog') & update search index
        ImportService-->>ServerAction: Success result (createdCount, updatedCount)
        ServerAction-->>UI: 200 OK: Summary statistics
        UI-->>Editor: Display import success toast & refresh catalog table
    end
```

---

## 2. Quoting & Order Acceptance

### SEQ-2: Dynamic Quoting, Digest Fingerprinting & Reconfirmation

How the server provides authoritative pricing, generates cryptographic confirmation fingerprints, and forces reconfirmation if prices change.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Storefront Customer
    participant UI as Checkout UI<br/>(CheckoutClient)
    participant ServerAction as Server Action<br/>(getQuoteAction)
    participant QuotingEngine as QuotingEngine
    participant CatalogRepo as ProductRepository
    participant ListRepo as SchoolSupplyListRepository

    Customer->>UI: View Cart or List Selection at Checkout
    UI->>ServerAction: getQuote(lines: { variantId, quantity }[], supplyListId?)
    ServerAction->>QuotingEngine: calculateQuote(request)

    QuotingEngine->>CatalogRepo: getLiveVariantsByIds(variantIds)
    CatalogRepo-->>QuotingEngine: Variant models (live prices in piasters, active status)

    alt Order comes from School Supply List
        QuotingEngine->>ListRepo: getActiveListOffer(supplyListId)
        ListRepo-->>QuotingEngine: ListOffer (% discount, active window)
    end

    loop For each item line
        QuotingEngine->>QuotingEngine: Calculate unit price in piasters (CO-9)
        QuotingEngine->>QuotingEngine: Apply List Offer discount if applicable (CO-8)
        QuotingEngine->>QuotingEngine: Round line total half-up to exact piaster (CO-8)
    end

    QuotingEngine->>QuotingEngine: Add flat shipping fee (50 EGP / 5000 piasters) (CO-7)
    QuotingEngine->>QuotingEngine: Compute subtotal, discount total, and grand total
    QuotingEngine->>QuotingEngine: Generate Confirmation Digest<br/>SHA256(lines, prices, discounts, shipping, total) (CO-3)

    QuotingEngine-->>ServerAction: QuoteDTO { items, discounts, shipping, total, confirmationDigest }
    ServerAction-->>UI: Return authoritative QuoteDTO
    UI->>UI: Store confirmationDigest in client state & render quote summary
    UI-->>Customer: Display price breakdown in EGP
```

---

### SEQ-3: Atomic Order Acceptance & Stock Hold (B2C & List Orders)

The all-or-nothing checkout transaction creating the immutable order, freezing lines, holding warehouse stock, and enqueuing notifications.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Storefront Customer
    participant UI as Checkout UI<br/>(CheckoutClient)
    participant ServerAction as Server Action<br/>(placeOrderAction)
    participant CheckoutService as CheckoutService
    participant QuotingEngine as QuotingEngine
    participant InventoryRepo as InventoryRepository
    participant DB as PostgreSQL (Drizzle)
    participant Outbox as OutboxRepository

    Customer->>UI: Click "Place Order" (Cash on Delivery)
    UI->>ServerAction: submitOrder({ confirmationDigest, lines, address, phone, idempotencyKey, supplyListId? })
    ServerAction->>CheckoutService: processCheckout(command)

    CheckoutService->>DB: Check idempotencyKey in orders table
    alt Duplicate Idempotency Key
        DB-->>CheckoutService: Existing Order found
        CheckoutService-->>ServerAction: Return original Order (CO-5)
        ServerAction-->>UI: 200 OK: Existing order reference
    else New Request
        CheckoutService->>QuotingEngine: recalculateQuote(command.lines, command.supplyListId)
        QuotingEngine-->>CheckoutService: Fresh Quote + Fresh Digest

        alt Fresh Digest != Submitted Confirmation Digest (CO-3)
            CheckoutService-->>ServerAction: 409 Conflict: Quote Expired / Changed
            ServerAction-->>UI: Prompt Customer to reconfirm updated terms
        else Digest Matches
            CheckoutService->>InventoryRepo: checkAvailableStock(command.lines)
            alt Any Variant Out of Stock (CO-4)
                InventoryRepo-->>CheckoutService: Shortage detected
                CheckoutService-->>ServerAction: 422 Unprocessable: Insufficient Stock
                ServerAction-->>UI: Entire order rejected: show stock shortage alert
            else All Stock Available
                rect rgb(240, 248, 255)
                note over CheckoutService,Outbox: ATOMIC DATABASE TRANSACTION (CO-4, CO-10)
                CheckoutService->>DB: Begin Transaction
                CheckoutService->>DB: Generate Order Reference (FE-xxxxxx) (CO-14)
                CheckoutService->>DB: INSERT INTO orders (reference, status='pending', payment='unpaid', total, shipping)
                CheckoutService->>DB: INSERT INTO order_lines (order_id, variant_id, frozen_name, frozen_sku, frozen_price)
                
                opt Order from School Supply List
                    CheckoutService->>DB: INSERT INTO attributed_orders (order_id, supply_list_id, business_partner_id) (PA-15)
                end

                CheckoutService->>DB: INSERT INTO stock_reservations (order_id, variant_id, warehouse_id, quantity) (CO-11)
                CheckoutService->>Outbox: INSERT INTO outbox_messages (channel='email', template='order_confirmation', payload) (CO-16)
                CheckoutService->>DB: Commit Transaction
                end

                CheckoutService-->>ServerAction: OrderAcceptedResult { orderReference, total }
                ServerAction-->>UI: 201 Created: { orderReference: 'FE-xxxxxx' }
                UI->>UI: Clear local Cart or List Selection (CO-10)
                UI-->>Customer: Redirect to Confirmation Page with FE-xxxxxx
            end
        end
    end
```

---

## 3. Operations & Fulfillment

### SEQ-4: COD Phone Confirmation, Dispatch & Cash Settlement Pipeline

The operational journey moving an order through phone verification, warehouse packing, courier delivery, and financial reconciliation.

```mermaid
sequenceDiagram
    autonumber
    actor Ops as Operations Staff
    actor Customer as Customer
    actor Courier as Logistics Courier
    participant Dashboard as Operations Dashboard UI
    participant ServerAction as Server Action<br/>(updateOrderStatusAction)
    participant FulfillmentService as OrderFulfillmentService
    participant AuthGuard as IPermissionService (ID-3)
    participant DB as PostgreSQL (Drizzle)
    participant Outbox as OutboxRepository

    Note over Ops,Dashboard: Step 1: Customer Phone Verification (CO-18)
    Ops->>Dashboard: View Order in Pending Queue (Inspect Phone & Delivery Address)
    Ops->>Customer: Phone call to verify Cash on Delivery purchase
    Customer-->>Ops: Confirms order and address details
    
    Ops->>Dashboard: Click "Confirm Order"
    Dashboard->>ServerAction: confirmOrder(orderId)
    ServerAction->>AuthGuard: requireRole('operations' | 'admin')
    ServerAction->>FulfillmentService: transitionStatus(orderId, 'confirmed')
    
    FulfillmentService->>DB: Begin Transaction
    FulfillmentService->>DB: UPDATE orders SET status='confirmed' WHERE status='pending'
    FulfillmentService->>DB: INSERT INTO audit_logs (staff_id, action='order_confirmed', order_id) (ID-3)
    FulfillmentService->>DB: Commit Transaction
    Dashboard-->>Ops: Status updated to Confirmed

    Note over Ops,Dashboard: Step 2: Warehouse Packing & Dispatch
    Ops->>Dashboard: Click "Send to Warehouse"
    Dashboard->>ServerAction: transitionStatus(orderId, 'processing')
    ServerAction->>FulfillmentService: transitionStatus(orderId, 'processing')
    FulfillmentService->>DB: UPDATE orders SET status='processing'
    
    Ops->>Courier: Handover packed parcel with Waybill & Order Reference FE-xxxxxx
    Ops->>Dashboard: Click "Dispatch Courier"
    Dashboard->>ServerAction: transitionStatus(orderId, 'shipped')
    ServerAction->>FulfillmentService: transitionStatus(orderId, 'shipped')
    FulfillmentService->>DB: Begin Transaction
    FulfillmentService->>DB: UPDATE orders SET status='shipped'
    FulfillmentService->>Outbox: INSERT INTO outbox_messages (template='order_shipped')
    FulfillmentService->>DB: Commit Transaction

    Note over Courier,Customer: Step 3: Delivery & COD Collection (CO-11)
    Courier->>Customer: Delivers parcel and collects COD cash in EGP
    Customer-->>Courier: Hands cash payment
    Courier->>Ops: Remit collected cash and provide delivery manifest

    Ops->>Dashboard: Click "Mark Delivered"
    Dashboard->>ServerAction: markDelivered(orderId)
    ServerAction->>FulfillmentService: completeDelivery(orderId)
    
    rect rgb(240, 248, 255)
    note over FulfillmentService,DB: Delivery Transaction (CO-11, CO-12)
    FulfillmentService->>DB: Begin Transaction
    FulfillmentService->>DB: UPDATE orders SET status='delivered', payment_status='paid'
    FulfillmentService->>DB: DELETE FROM stock_reservations WHERE order_id = orderId (Stock Consumed)
    FulfillmentService->>DB: UPDATE inventory SET on_hand = on_hand - reserved_units
    FulfillmentService->>Outbox: INSERT INTO outbox_messages (template='order_delivered')
    FulfillmentService->>DB: Commit Transaction
    end
    Dashboard-->>Ops: Order marked Delivered & Paid
```

---

## 4. School Partner Program

### SEQ-5: School Supply List Authoring, Freezing & Slot Replacement

How staff curates lists, freezes specifications on publish, and automatically supersedes existing versions in the same slot.

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Catalog & Content Editor
    participant UI as Dashboard List Editor UI
    participant ServerAction as Server Action<br/>(publishSupplyListAction)
    participant ListService as SchoolSupplyListService
    participant Validation as ListSpecificationValidator
    participant DB as PostgreSQL (Drizzle)

    Staff->>UI: Complete editing Draft List for Slot (School, 2026-2027, Grade 4)
    Staff->>UI: Click "Publish List"
    UI->>ServerAction: publishList(listId)
    ServerAction->>ListService: publishSupplyList(listId, staffId)

    ListService->>Validation: validatePrePublishInvariants(listId)
    Validation->>DB: Fetch draft list items and default variants
    
    alt Invariant Violation (SL-5)
        Validation-->>ListService: Empty list OR default variant inactive/missing OR default violates spec
        ListService-->>ServerAction: 422 Unprocessable: Invariant error
        ServerAction-->>UI: Display blocking error (Publish refused)
    else All Invariants Satisfied
        Validation-->>ListService: Validation passed (Stock shortages warn only SL-5)
        
        rect rgb(240, 248, 255)
        note over ListService,DB: PUBLISH & SLOT REPLACEMENT TRANSACTION (SL-2, SL-4, SL-6)
        ListService->>DB: Begin Transaction
        ListService->>ListService: Generate Cryptographic Unguessable Public Code (SL-6)
        ListService->>DB: Query existing published list in same Slot (School, Year, Grade) (SL-3)
        
        opt Existing Published List Found in Slot (List Replacement SL-4)
            ListService->>DB: UPDATE school_supply_lists SET status='archived' WHERE id = existingList.id
            ListService->>DB: UPDATE school_supply_lists SET replaces_list_id = existingList.id WHERE id = listId
        end

        ListService->>DB: UPDATE school_supply_lists SET status='published', public_code = generatedCode, published_at = NOW() WHERE id = listId
        ListService->>DB: Freeze list items, categories, attribute specifications and quantities (SL-2)
        ListService->>DB: Commit Transaction
        end

        ListService-->>ServerAction: PublishSuccess { listId, publicCode, replacedListId? }
        ServerAction-->>UI: 200 OK: Published with Public Code
        UI-->>Staff: Display shareable public link and replacement confirmation
    end
```

---

### SEQ-6: School Supply List Runtime Alternative Resolution & Selection

How families query allowed alternative products matching frozen specifications and build an isolated List Selection.

```mermaid
sequenceDiagram
    autonumber
    actor Family as School Family / Customer
    participant UI as Public School List UI<br/>(SchoolSupplyListClient)
    participant ServerAction as Server Action<br/>(getAllowedAlternativesAction)
    participant ListService as SchoolSupplyListService
    participant CatalogRepo as ProductRepository
    participant DeviceStorage as Local Device Storage

    Family->>UI: Open School Supply List via Public Code URL (SL-6)
    UI->>Family: Render items table (Exact items vs. Non-exact Specifications)

    Family->>UI: Click "Change / Swap" on Specification line (e.g. 80-page Ruled Notebook)
    UI->>ServerAction: getAlternatives(listId, listItemId)
    ServerAction->>ListService: resolveAllowedAlternatives(listId, listItemId)

    ListService->>ListService: Fetch item Specification (Category: Notebooks, Attrs: { Pages: 80, Rule: Ruled })
    ListService->>CatalogRepo: findActiveVariantsBySpecification(categoryId, requiredAttributes)
    CatalogRepo-->>ListService: Matching live active variants in catalog (SL-8, CA-4)

    loop For each matching variant
        ListService->>ListService: Compute price delta vs default variant (piasters)
        ListService->>ListService: Attach brand name, media thumbnail, and differing attributes
    end

    ListService-->>ServerAction: AllowedAlternativeDTO[]
    ServerAction-->>UI: Return allowed alternatives list
    UI-->>Family: Open Modal: Display alternatives with brand, price delta & specs

    Family->>UI: Select alternative variant and set quantity
    UI->>DeviceStorage: Update ListSelection state (isolated from Cart SL-10)
    UI->>UI: Recalculate Advisory List Completeness progress ring (SL-12)
    UI-->>Family: Render updated item line and completeness percentage
```

---

## 5. Security, Identity & Privacy

### SEQ-7: Passwordless Guest Order Access & Rate-Limited OTP

How guests view order tracking timelines without passwords while preventing account enumeration and brute-force attacks.

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Guest Customer
    participant UI as Guest Lookup UI<br/>(GuestOrderLookup)
    participant ServerAction as Server Action<br/>(requestGuestAccessAction)
    participant AuthService as GuestAccessService
    participant DB as PostgreSQL (Drizzle)
    participant Outbox as OutboxRepository

    Guest->>UI: Enter Order Reference (FE-xxxxxx) and Email Address
    UI->>ServerAction: requestAccessCode(reference, email)
    ServerAction->>AuthService: initiateGuestVerification(reference, email)

    AuthService->>DB: Check code requests count for order in past 1 hour (CO-15)
    alt Rate Limit Exceeded (> 3 requests per hour)
        AuthService-->>ServerAction: 429 Too Many Requests
        ServerAction-->>UI: Display hourly rate limit warning
    else Rate Limit OK
        AuthService->>DB: Find order matching reference and email
        
        note over AuthService: Constant-Time Response (CO-15: Never reveal if order exists)
        alt Order Found
            AuthService->>AuthService: Generate cryptographically secure 6-digit OTP
            AuthService->>DB: INSERT INTO guest_order_access (order_ref, email, otp_hash, expires_at=NOW()+15m, attempts=5)
            AuthService->>Outbox: INSERT INTO outbox_messages (template='guest_order_otp', payload={ otp })
        else Order Not Found
            AuthService->>AuthService: Perform dummy hash to equalize response timing
        end

        AuthService-->>ServerAction: Success (Always identical generic response)
        ServerAction-->>UI: "If matching order exists, a 6-digit code has been sent."
        UI-->>Guest: Prompt for 6-digit Access Code

        Guest->>UI: Enter 6-digit code received via email
        UI->>ServerAction: verifyCode(reference, email, code)
        ServerAction->>AuthService: validateGuestOTP(reference, email, code)

        AuthService->>DB: Query active guest_order_access row
        alt Code Expired (> 15 min) OR Attempts Exceeded (CO-15)
            AuthService-->>ServerAction: 401 Unauthorized: Code expired or max attempts reached
            ServerAction-->>UI: Show expired code error: Request new code
        else Code Incorrect
            AuthService->>DB: UPDATE guest_order_access SET attempts = attempts - 1
            AuthService-->>ServerAction: 401 Unauthorized: Incorrect code (attempts remaining)
            ServerAction-->>UI: Show invalid code error with remaining attempts
        else Code Verified
            AuthService->>DB: DELETE FROM guest_order_access WHERE id = accessRow.id
            AuthService->>AuthService: Issue short-lived scoped JWT session token
            AuthService-->>ServerAction: AuthenticatedGuestSession
            ServerAction-->>UI: Set secure HttpOnly session cookie
            UI-->>Guest: Render Order Details & Fulfillment Timeline
        end
    end
```

---

### SEQ-8: Partner Member Invitation & Tokenized Acceptance

How school staff join their school's Partner Workspace via 7-day tokenized invitations.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Partner Administrator
    actor Invitee as Invited School Staff
    participant UI as Partner Workspace UI
    participant ServerAction as Server Action<br/>(invitePartnerMemberAction)
    participant MemberService as PartnerMembershipService
    participant DB as PostgreSQL (Drizzle)
    participant Outbox as OutboxRepository

    Admin->>UI: Open Invite Member Dialog, enter email & select Partner Roles (PA-5)
    UI->>ServerAction: inviteMember({ email, roles })
    ServerAction->>MemberService: createInvitation(businessPartnerId, email, roles, adminId)

    MemberService->>DB: Check for existing pending invitation for email (PA-9)
    opt Pending Invitation Exists
        MemberService->>DB: Revoke old invitation record
    end

    MemberService->>MemberService: Generate 7-day secret invitation token (PA-9)
    MemberService->>DB: Begin Transaction
    MemberService->>DB: INSERT INTO partner_invitations (partner_id, email, roles, token_hash, expires_at=NOW()+7d, status='pending')
    MemberService->>DB: INSERT INTO partner_access_history (action='invitation_created', actor_id=adminId) (PA-12)
    MemberService->>Outbox: INSERT INTO outbox_messages (template='partner_invite', payload={ inviteUrl })
    MemberService->>DB: Commit Transaction
    MemberService-->>ServerAction: Success
    ServerAction-->>UI: 200 OK: Invitation sent

    Note over Invitee,UI: Invitee Acceptance Flow (PA-9)
    Invitee->>UI: Click invitation link in email (contains secret token)
    UI->>ServerAction: validateInvitationToken(token)
    ServerAction->>MemberService: inspectToken(token)
    MemberService->>DB: Verify token exists, status='pending' and expires_at > NOW()
    
    alt Invitee Not Signed In OR Signed In with Wrong Email
        MemberService-->>ServerAction: Auth required matching invited email
        ServerAction-->>UI: Prompt: Sign in with invited email address
        Invitee->>UI: Signs in / registers with matching email
    end

    UI->>Invitee: Display school name, granted roles & explicit "Accept" button
    Invitee->>UI: Click "Accept Invitation" (Explicit action PA-9)
    UI->>ServerAction: acceptInvitation(token)
    ServerAction->>MemberService: executeAcceptance(token, inviteeUserId)

    rect rgb(240, 248, 255)
    note over MemberService,DB: ACCEPTANCE TRANSACTION (PA-8, PA-12)
    MemberService->>DB: Begin Transaction
    MemberService->>DB: UPDATE partner_invitations SET status='accepted' WHERE id = inviteId
    MemberService->>DB: INSERT INTO partner_memberships (partner_id, user_id, roles, status='active')
    MemberService->>DB: INSERT INTO partner_access_history (action='member_joined', user_id=inviteeUserId)
    MemberService->>DB: Commit Transaction
    end

    MemberService-->>ServerAction: AcceptanceConfirmed
    ServerAction-->>UI: Redirect to Partner Workspace (/[locale]/partner/[code])
    UI-->>Invitee: Welcome to School Partner Workspace
```

---

### SEQ-9: Privacy-Preserving Monthly Partner Reporting Pipeline

How aggregated monthly reports are generated with strict k-anonymity privacy guarantees.

```mermaid
sequenceDiagram
    autonumber
    actor Bursar as Partner Report Viewer
    participant UI as Partner Workspace UI<br/>(PartnerReportView)
    participant ServerAction as Server Action<br/>(getMonthlyReportAction)
    participant ReportService as PartnerReportingService
    participant AuthGuard as IPermissionService (PA-13)
    participant DB as PostgreSQL (Drizzle)

    Bursar->>UI: Select Report Period: Year 2026, Month 09 (Cairo Time)
    UI->>ServerAction: fetchReport(partnerId, year, month)
    ServerAction->>AuthGuard: requirePartnerRole(partnerId, 'report-viewer' | 'partner-administrator')
    AuthGuard-->>ServerAction: Authorized
    ServerAction->>ReportService: generateMonthlyReport(partnerId, year, month)

    ReportService->>DB: Query Attributed Orders for partner in Cairo month range (PA-14)
    ReportService->>DB: Filter OUT cancelled and refunded orders (PA-14)
    DB-->>ReportService: List of qualifying OrderLines with orderId, variantId, units, price

    ReportService->>ReportService: Group qualifying sales lines by (item_name, variant_name)
    
    loop For each distinct (item, variant) group
        ReportService->>ReportService: Count distinct orderId values contributing to group
        alt Distinct Orders >= 3 (k-Anonymity satisfied PA-14)
            ReportService->>ReportService: Keep as individual visible report row
        else Distinct Orders < 3 (Privacy Threshold Violation)
            ReportService->>ReportService: Add units and revenue to accumulator row: "Other items" (PA-14)
        end
    end

    ReportService->>ReportService: Verify report contains NO customer names, NO order references, and NO order counts (PA-14)
    ReportService->>ReportService: Calculate monthly grand total units and total piasters
    ReportService-->>ServerAction: MonthlyPartnerReportDTO { period, rows, otherItemsRow, totalPiasters }
    ServerAction-->>UI: Return report payload
    UI-->>Bursar: Render privacy-compliant monthly sales breakdown
```

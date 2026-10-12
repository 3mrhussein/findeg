# Enterprise User Flow Diagrams

As of 2026-10-12 · Clarity: **Enterprise User Experience & Journey Specifications**

This document catalogs the complete end-to-end user flows for all human personas across the FindEg platform: Customers (Guests & Registered), Partner School Members, and FindEg Operations Staff.

---

## 1. Customer User Flows

### UF-1: B2C Storefront Shopping Journey (Catalog to Checkout)

The standard direct-to-consumer flow where a customer browses the catalog, builds a Cart, and places a Cash on Delivery (COD) order.

```mermaid
flowchart TD
    Start([Customer visits Storefront]) --> Browse[Browse Home Banners, Categories & Collections]
    Browse --> SearchChoice{How does Customer find items?}
    SearchChoice -->|Keyword Search| SearchResults[Search Results + Attribute & Tag Filters]
    SearchChoice -->|Category Tree| CategoryPage[Category Page]
    SearchChoice -->|Curated Collection| CollectionPage[Collection Page e.g. Gift Guides]

    SearchResults --> SelectProduct[Select Product]
    CategoryPage --> SelectProduct
    CollectionPage --> SelectProduct

    SelectProduct --> PDP[Product Detail Page]
    PDP --> ReviewVariant[Inspect Default Variant, Images, Price & Stock]
    ReviewVariant --> ChangeVariant{Wants another variant?}
    ChangeVariant -->|Yes| SelectVariant[Choose Color, Size or Weight]
    ChangeVariant -->|No| KeepVariant[Keep Default Variant]
    
    SelectVariant --> AddToCart[Add to Cart]
    KeepVariant --> AddToCart
    AddToCart --> ContinueShopping{Continue Shopping?}
    ContinueShopping -->|Yes| Browse
    ContinueShopping -->|No| OpenCart[Open Cart Drawer / Page]

    OpenCart --> ReviewCart[Review Items, Quantities & Piaster Total]
    ReviewCart --> ProceedCheckout[Proceed to Checkout]

    ProceedCheckout --> AuthChoice{Customer Authentication}
    AuthChoice -->|Signed-in| LoadAddresses[Pre-fill Saved Delivery Address]
    AuthChoice -->|Guest| EnterGuestDetails[Enter Name, Email, Phone & Delivery Address]

    LoadAddresses --> ReviewShipping[Review Flat Shipping Fee: 50 EGP]
    EnterGuestDetails --> ReviewShipping

    ReviewShipping --> PaymentMethod[Select Payment Method: Cash on Delivery]
    PaymentMethod --> RequestQuote[Fetch Server Authoritative Quote]
    RequestQuote --> QuoteVerification{Quote Digest Matches Confirmation?}
    QuoteVerification -->|Price / Stock Changed| ReconfirmAlert[Display Price/Shipping Change Alert & Reconfirm]
    ReconfirmAlert --> RequestQuote
    QuoteVerification -->|Matches| PlaceOrder[Click Place Order]

    PlaceOrder --> AtomicAcceptance[Server Executes Atomic Order Acceptance]
    AtomicAcceptance --> StockCheck{Stock Available at Warehouse?}
    StockCheck -->|No| OrderRejected[Show Stock Shortage Error: Entire Order Rejected]
    StockCheck -->|Yes| OrderCreated[Order Created with Reference FE-xxxxxx<br/>Stock Reserved<br/>Outbox Email Enqueued]
    OrderCreated --> ThankYouPage[View Order Confirmation Page with Order Reference]
```

---

### UF-2: School Supply List Family Journey (B2B2C Partner Service)

The journey of a family fulfilling their child's school requirements through a single published list.

```mermaid
flowchart TD
    Start([Family receives School Supply List Link]) --> OpenLink[Open Public Link via Public Code]
    OpenLink --> ValidateList{Is List Valid?}
    ValidateList -->|Draft / Not Found| ErrorPage[404 Not Found: Drafts never public]
    ValidateList -->|Archived| ArchivedNotice[Show Archived Banner & Link to Replacement List]
    ArchivedNotice --> OpenReplacement[Navigate to Active Replacement List]
    ValidateList -->|Published| RenderList[Render Published School Supply List]

    OpenReplacement --> RenderList
    RenderList --> DisplayHeader[Display Partner School Name, Grade, Academic Year & List Offer %]
    DisplayHeader --> IterateItems[Review Curated List Items]

    IterateItems --> ItemType{Item Line Type}
    ItemType -->|Exact Item| ExactLine[Fixed Product Variant: No Substitution Allowed]
    ItemType -->|Specification| SpecLine[Item Specification: Category + Attributes Defined]

    ExactLine --> QuantityChoice{Adjust Prescribed Quantity?}
    SpecLine --> AlternativeChoice{Choose Alternative Variant?}

    AlternativeChoice -->|Keep Default| KeepDefault[Retain Curated Default Variant]
    AlternativeChoice -->|Browse Alternatives| ModalOpen[Open Allowed Alternatives Modal]

    ModalOpen --> QueryAlternatives[Engine computes matching live variants]
    QueryAlternatives --> ReviewAltList[Compare Brand, Specs & Price Deltas]
    ReviewAltList --> SelectAlternative[Select Preferred Variant]
    SelectAlternative --> UpdateLine[Update Line with Chosen Variant]

    KeepDefault --> QuantityChoice
    UpdateLine --> QuantityChoice

    QuantityChoice --> SetQty[Set Item Quantity in List Selection]
    SetQty --> CompletenessCheck[Evaluate Advisory List Completeness Indicator]
    CompletenessCheck --> AddMoreItems{Review remaining items?}
    AddMoreItems -->|Yes| IterateItems
    AddMoreItems -->|No| ReviewSelection[Review List Selection Summary & List Offer Discount]

    ReviewSelection --> ProceedListCheckout[Proceed to List Checkout]
    ProceedListCheckout --> VerifyEligibility{All selected variants active & allowed?}
    VerifyEligibility -->|No: Inactive Variant| ExactCheck{Is line an Exact Item?}
    ExactCheck -->|Yes: Exact Item (SL-8 No Substitutes)| BlockedItem[Flag item as Unavailable: Requires Staff List Replacement or Removal]
    ExactCheck -->|No: Has Specification| FlaggedLine[Flag line as 'Choose Again': Checkout Disabled]
    FlaggedLine --> AlternativeChoice
    VerifyEligibility -->|Yes| CheckoutScreen[Enter Delivery Address & Contact Phone]

    CheckoutScreen --> ListQuote[Server calculates Quote with List Offer % discount]
    ListQuote --> SubmitListOrder[Confirm Cash on Delivery Order]
    SubmitListOrder --> AtomicListAcceptance[Atomic Acceptance: Freeze Attribution + AttributedOrder + Reserve Stock]
    AtomicListAcceptance --> ConfirmationScreen[Order Confirmation with FE-xxxxxx & Attributed School]
```

---

### UF-3: Guest Order Tracking Flow (Passwordless Access)

How a customer without an account securely verifies and inspects their order status.

```mermaid
flowchart TD
    Start([Guest wants to track order]) --> LookupPage[Visit Guest Order Lookup Page]
    LookupPage --> EnterCredentials[Enter Order Reference FE-xxxxxx and Email Address]
    EnterCredentials --> SubmitLookup[Submit Request]

    SubmitLookup --> RateCheck{Exceeded 3 requests per hour?}
    RateCheck -->|Yes| RateLimitMsg[Display Rate Limit Warning]
    RateCheck -->|No| ServerCheck[Server validates Reference & Email]

    ServerCheck --> NeutralResponse[System always responds identically to prevent enumeration]
    NeutralResponse --> OrderFound{Did matching order exist?}
    OrderFound -->|No| NoEmail[No email sent]
    OrderFound -->|Yes| SendOTP[Generate 6-digit OTP<br/>Valid for 15 minutes / 5 attempts<br/>Enqueue Outbox Email]

    SendOTP --> CustomerReceives[Customer checks email for Access Code]
    CustomerReceives --> EnterOTP[Enter 6-digit Code on Lookup Page]
    NoEmail --> EnterOTP

    EnterOTP --> VerifyAttempt[Server validates OTP]
    VerifyAttempt --> OTPValid{Is Code Correct & < 15 min?}
    OTPValid -->|Expired / Exceeded 5 attempts| ErrorLocked[Code Expired / Invalid: Request New Code]
    ErrorLocked --> EnterCredentials
    OTPValid -->|Incorrect| DecrementAttempts[Show Invalid Code: Remaining attempts decremented]
    DecrementAttempts --> EnterOTP
    OTPValid -->|Valid| GrantAccess[Grant Temporary Order Session]

    GrantAccess --> OrderDetailsPage[Display Order Status Timeline, Delivery Address & Purchased Items]
```

---

## 2. Partner User Flows

### UF-4: Partner Member Onboarding Flow

How school administrators and bursars join their school's Partner Workspace.

```mermaid
flowchart TD
    Start([Invitee receives Partner Invitation Email]) --> OpenInviteLink[Click 7-Day Secret Invitation Link]
    OpenInviteLink --> TokenValidation{Is Invitation Valid?}
    TokenValidation -->|Expired > 7 days| ExpiredScreen[Invitation Expired: Contact School Admin to Resend]
    TokenValidation -->|Revoked / Accepted| InvalidScreen[Invitation No Longer Valid]
    TokenValidation -->|Pending| AuthCheck{Is Invitee Signed In?}

    AuthCheck -->|Not signed in| SignInPrompt[Prompt: Sign in or Register with Invited Email Address]
    SignInPrompt --> Authenticate[User Authenticates]
    AuthCheck -->|Signed in with different email| MismatchPrompt[Warn: Current account does not match invited email]
    MismatchPrompt --> SwitchAccount[Sign in with correct invited email]
    SwitchAccount --> Authenticate
    AuthCheck -->|Signed in with matching email| ReviewRoles[Display Invitation Acceptance Page]
    Authenticate --> ReviewRoles

    ReviewRoles --> DisplayInvitedRoles[Show Business Partner Name & Granted Partner Roles]
    DisplayInvitedRoles --> ExplicitAction{User Decision}
    ExplicitAction -->|Decline / Ignore| IgnoreInvite[Invitation remains pending until 7-day expiry]
    ExplicitAction -->|Explicit Accept| AcceptInvite[Click Accept Invitation]

    AcceptInvite --> ProcessAcceptance[Server updates Invitation to Accepted<br/>Creates active Partner Membership<br/>Appends to Partner Access History]
    ProcessAcceptance --> EnterWorkspace[Redirect to Partner Workspace /locale/partner/code]
```

---

### UF-5: Partner Administrator Governance Flow

How a partner administrator manages memberships and invitations for their school.

```mermaid
flowchart TD
    Start([Partner Admin enters Workspace]) --> NavMembers[Navigate to Members & Permissions Tab]
    NavMembers --> ViewList[View Current Members, Roles & Pending Invitations]
    ViewList --> ActionChoice{Select Action}

    ActionChoice -->|Invite New Member| OpenInviteModal[Open Invite Member Modal]
    OpenInviteModal --> EnterDetails[Enter Colleague Email & Select Partner Roles]
    EnterDetails --> SubmitInvite[Send Invitation]
    SubmitInvite --> CheckExisting{Pending invite exists for email?}
    CheckExisting -->|Yes| ResendInvite[Resend keeps previous token valid & extends]
    CheckExisting -->|No| CreateInvite[Create 7-Day Partner Invitation in Outbox]
    CreateInvite --> RefreshMembers[Update Table with Pending Status]
    ResendInvite --> RefreshMembers

    ActionChoice -->|Change Member Roles| SelectMember[Select Active Member]
    SelectMember --> ToggleRoles[Toggle Roles: admin, report-viewer, etc.]
    ToggleRoles --> AdminCheck{Would this remove the last active Admin?}
    AdminCheck -->|Yes| BlockChange[Error PA-7: Partner must keep at least 1 active Admin]
    AdminCheck -->|No| SaveRoles[Save Role Changes & Append Access History]

    ActionChoice -->|Suspend Member| SuspendChoice[Click Suspend Member]
    SuspendChoice --> AdminCheck
    SuspendChoice --> ConfirmSuspend[Set status to Suspended: Workspace access revoked]

    ActionChoice -->|Reactivate Member| ReactivateChoice[Click Reactivate on Suspended Member]
    ReactivateChoice --> StatusCheck{Is Member Ended?}
    StatusCheck -->|Yes| BlockReactivate[Error PA-8: Ended memberships are terminal]
    StatusCheck -->|No| ConfirmReactivate[Restore status to Active]

    ActionChoice -->|End Membership| RemoveMember[Click Remove Member]
    RemoveMember --> AdminCheck
    RemoveMember --> SetEnded[Set status to Ended: Permanently terminated]
```

---

### UF-6: Partner Report Viewer Flow (Privacy-Preserving Analytics)

How school leaders view aggregate sales generated by their supply lists.

```mermaid
flowchart TD
    Start([Report Viewer enters Workspace]) --> NavReports[Navigate to Sales Reports Tab]
    NavReports --> PermCheck{Has report-viewer or admin role?}
    PermCheck -->|No| Denied[Access Denied]
    PermCheck -->|Yes| SelectPeriod[Select Year & Month (Cairo Time)]

    SelectPeriod --> FetchReport[Query Attributed Orders for School]
    FetchReport --> FilterOrders[Exclude Cancelled & Refunded Orders]
    FilterOrders --> GroupByItem[Group Sales by List Item and Variant]

    GroupByItem --> EvaluateKAnonymity{Does line have >= 3 distinct Orders?}
    EvaluateKAnonymity -->|Yes| DisplayLine[Display Item Name, Variant & Monthly Units Sold]
    EvaluateKAnonymity -->|No: < 3 Orders| FoldLine[Fold into 'Other Items' Aggregate Row]

    DisplayLine --> RenderTable[Render Monthly Partner Report]
    FoldLine --> RenderTable
    RenderTable --> PrivacyAssurance[Verify: No Customer Names, No Order References, No Order Counts Shown]
```

---

## 3. FindEg Staff User Flows

### UF-7: Staff Catalog & Merchandising Flow

How internal staff curate and maintain the stationery store.

```mermaid
flowchart TD
    Start([Catalog Editor signs in to Dashboard]) --> NavCatalog[Navigate to Products & Catalog]
    NavCatalog --> IngestionChoice{How to add catalog items?}

    IngestionChoice -->|Bulk Spreadsheet| OpenImport[Open Catalog Spreadsheet Importer]
    OpenImport --> UploadCSV[Upload .xlsx / .csv spreadsheet with SKUs, names & prices]
    UploadCSV --> ValidateSheet[Validate Category references, SKU uniqueness & Piaster prices]
    ValidateSheet --> HasErrors{Errors found?}
    HasErrors -->|Yes| RejectSheet[Reject entire file with row-by-row error report]
    RejectSheet --> UploadCSV
    HasErrors -->|No| IngestBatch[Create/Update Products & Variants in DB]

    IngestionChoice -->|Manual Entry| NewProduct[Click Add New Product]
    NewProduct --> EnterBilingual[Enter English and Arabic Names & Descriptions]
    EnterBilingual --> AssignCategory[Assign single strict Category in hierarchy]
    AssignCategory --> CreateDefaultVariant[Create Default Variant with SKU, Price in EGP & Stock]
    CreateDefaultVariant --> AddMoreVariants{Product has multiple variants?}
    AddMoreVariants -->|Yes| CreateVariants[Add Variant colors/sizes with SKUs]
    AddMoreVariants -->|No| UploadMedia[Upload & Attach Media Assets / Supplier Photos]
    CreateVariants --> UploadMedia

    UploadMedia --> SetActive[Toggle Product Active Status]
    IngestBatch --> ManageMerchandising[Manage Navigation, Tags, Collections & Home Banners]
    SetActive --> ManageMerchandising
    ManageMerchandising --> LiveStorefront[Changes appear on live storefront]
```

---

### UF-8: Staff School Supply List Authoring & Versioning Flow

How staff create, validate, publish, and replace supply lists.

```mermaid
flowchart TD
    Start([Staff creates School Supply List]) --> SelectPartnerSchool[Select Onboarding or Active Partner School]
    SelectPartnerSchool --> DefineSlot[Assign Slot: Academic Year + Grade]
    DefineSlot --> CreateDraft[System creates Draft List]

    CreateDraft --> AddItems[Add Items to Draft List]
    AddItems --> ChooseType{Item Type}
    ChooseType -->|Exact Item| SelectExactVariant[Select single Product Variant: No substitutions]
    ChooseType -->|Specification| SetSpec[Define Category + Required Attributes e.g. Ruled, 80gsm]

    SelectExactVariant --> SetItemProperties[Set Prescribed Quantity, Required/Optional flag & Default Variant]
    SetSpec --> SetItemProperties
    SetItemProperties --> AddMore{Add more items?}
    AddMore -->|Yes| AddItems
    AddMore -->|No| ClickPublish[Click Publish List]

    ClickPublish --> PrePublishValidation{Validate List Invariants}
    PrePublishValidation -->|Empty List| BlockEmpty[Reject: List cannot be empty]
    PrePublishValidation -->|Default variant missing or inactive| BlockVariant[Reject: Default variant must be active & valid]
    PrePublishValidation -->|Default violates Spec| BlockSpec[Reject: Default variant must satisfy item Specification]
    PrePublishValidation -->|Stock shortage| WarnStock[Warning: Low stock defaults produce advisory notice only]
    WarnStock --> SlotCheck{Does slot already have a published list?}
    PrePublishValidation -->|Valid| SlotCheck

    SlotCheck -->|No: Slot is free| PublishNew[Publish List<br/>Generate unique unguessable Public Code<br/>Freeze specifications]
    SlotCheck -->|Yes: Existing list in slot| ReplaceFlow[Execute List Replacement SL-4]
    ReplaceFlow --> ArchiveSource[Set existing list to Archived<br/>Link source as replacesListId<br/>Archived list becomes read-only & non-buyable]
    ArchiveSource --> PublishNew

    PublishNew --> ShareLink[Public Code ready to share with school families]
```

---

### UF-9: Staff Operations & Order Fulfillment Flow

The fulfillment journey from phone verification to cash collection.

```mermaid
flowchart TD
    Start([Order placed: Status Pending]) --> Queue[Order appears in Operations Pending Queue]
    Queue --> ReserveStock[Stock is held in Warehouse Reservation]
    Queue --> OpsReview[Staff views Order Details & Phone Number]

    OpsReview --> PhoneCall[Operations agent phones Customer]
    PhoneCall --> CallOutcome{Call Outcome}

    CallOutcome -->|Unreachable / Refused| CancelOrder[Staff marks Cancelled with reason]
    CancelOrder --> ReleaseHold[Release Stock Reservation<br/>Order status becomes Cancelled terminal]

    CallOutcome -->|Customer Confirms COD| MarkConfirmed[Staff marks Order Confirmed CO-18]
    MarkConfirmed --> PickPack[Send to Warehouse: Status moves to Processing]

    PickPack --> WarehousePacks[Warehouse picks items & packs parcel]
    WarehousePacks --> Dispatch[Handover to Courier: Status moves to Shipped]
    Dispatch --> DeliveryAttempt{Courier Delivery Attempt}

    DeliveryAttempt -->|Customer Refuses Door / Undelivered| CourierReturn[Parcel returned to warehouse]
    CourierReturn --> CheckReturned[Verify parcel is physically back in warehouse]
    CheckReturned --> CancelShipped[Mark Cancelled: Release Stock Reservation CO-13]

    DeliveryAttempt -->|Successfully Delivered| CollectCash[Courier collects Cash on Delivery]
    CollectCash --> MarkDelivered[Mark Delivered: Stock CONSUMED, Payment marked PAID]
    MarkDelivered --> Complete([Order Fulfilled])

    Complete --> ReturnRequest{Customer requests return within policy?}
    ReturnRequest -->|Approved| ProcessRefund[Mark Refunded: Payment marked REFUNDED<br/>No stock effect: Restocked manually]
    ReturnRequest -->|No| Closed([Finished])
```

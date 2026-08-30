# Egyptian online card payment providers for FindEg

Research date: 2026-08-30

## Question and scope

Which providers can credibly support FindEg's phase-one EGP online card payments, temporary payment-time stock holds, successful-payment confirmation, refunds to the original method, reliable and idempotent webhooks, testing, settlement, security, operational support, and a small agent-assisted engineering team?

This is a non-exhaustive shortlist, not a provider selection. It covers four providers for which first-party sources establish active Egyptian payment acceptance and a plausible integration path: Paymob, Amazon Payment Services, FawryPay, and PayTabs. It records publicly documented capabilities separately from points that need a commercial or technical answer from the provider. Pricing, contractual service levels, risk reserves, and merchant-specific acquiring terms can change and must not be inferred from generic product documentation.

## Findings at a glance

- All four have a documented route to EGP card acceptance in Egypt and offer a hosted or provider-controlled checkout that can keep raw card data out of FindEg's application. Paymob documents its Egypt endpoint and online card/3-D Secure flow; Amazon Payment Services (APS) says it operates for Egyptian merchants and supports local and international cards; FawryPay documents EGP Visa, Mastercard, and Meeza card flows; and PayTabs has an Egypt-specific service and API endpoint. ([Paymob overview](https://developers.paymob.com/paymob-docs/developers/quicklink-apis/overview), [APS Egypt/Meeza](https://paymentservices.amazon.com/meeza), [FawryPay server APIs](https://developer.fawrystaging.com/public/docs/server-apis/server-apis-overview), [PayTabs Egypt](https://paytabs.com/en/egypt/))
- A temporary **stock** hold is FindEg domain state, not a payment-provider feature. Provider authorization/capture reserves cardholder funds; it does not reserve inventory. FindEg therefore needs its own expiring Inventory Hold and Payment Attempt before redirecting to any provider. After successful payment, the Inventory Hold becomes an Order Reservation when the Order is accepted. Provider transaction expiry and authorization/capture may complement that model but cannot replace it.
- Every candidate supplies a server-side payment-status mechanism. Public retry evidence differs: APS says failed webhooks are retried and tells merchants to implement idempotency; FawryPay retries non-200 notifications a preconfigured number of times; PayTabs IPN retries up to five times; Paymob documents authenticated callbacks as the source of truth but does not publicly specify retry or duplicate-delivery behavior. ([APS webhook guidance](https://paymentservices.amazon.com/docs/api/faqs/faq), [FawryPay Notification V2](https://developer.fawrystaging.com/docs/server-apis/payment-notifications/server-notification-v2), [PayTabs IPN](https://support.paytabs.com/en/support/solutions/articles/60000710069), [Paymob API flow](https://developers.paymob.com/paymob-docs/integration-paths/apis))
- No provider's webhook should be treated as inherently exactly-once. FindEg must authenticate notifications and make its own consumer idempotent around stable merchant/provider references. APS explicitly instructs this; FawryPay includes a notification `requestId`; PayTabs offers transaction references plus a query endpoint; and Paymob callbacks include transaction and order identifiers. ([APS FAQ](https://paymentservices.amazon.com/docs/api/faqs/faq), [FawryPay Notification V2](https://developer.fawrystaging.com/docs/server-apis/payment-notifications/server-notification-v2), [PayTabs response mechanisms](https://support.paytabs.com/en/support/solutions/articles/60000687835-what-are-the-five-5-ways-of-receiving-transaction-response-), [Paymob HMAC callback](https://developers.paymob.com/paymob-docs/developers/webhook-callbacks-and-hmac/hmac/hmac-transaction-callback))
- Public sources do not settle the commercial decision. A provider-specific written offer is still needed for enabled Egyptian card schemes, fees and taxes, payout timing and reserves, refund timing, webhook delivery guarantees, incident escalation, and production onboarding.

## Comparative evidence

| Provider | Publicly documented baseline | Most material points still requiring confirmation |
| --- | --- | --- |
| Paymob | Egypt-hosted/embedded checkout; EGP card examples; payment intentions; HMAC-authenticated callbacks; authorization/capture; same-method full/partial refunds; test/live credentials and webhook test tool | Callback retry/backoff/replay contract; request idempotency behavior; Egyptian authorization window and scheme coverage; settlement cadence/reserves/fees; support SLA |
| Amazon Payment Services | Available to Egyptian legal entities; international cards and Meeza; hosted checkout; authorization/capture; signed webhooks, retry guidance, status query; full/partial refund; sandbox/test cards/Postman; published generic settlement guidance | Egyptian acquiring offer and exact fees; webhook retry schedule/limit; explicit written confirmation that card refunds return on the original rail; scheme-specific auth/capture (Meeza does not support authorization); merchant-specific settlement/reserve terms |
| FawryPay | EGP Visa/Mastercard/Meeza; hosted checkout; payment expiry; authorization/capture; signed notifications with retry and status query; full/partial refund; staging/test cards; current PCI DSS attestation | Retry count/backoff and replay controls; explicit original-method refund wording and timing; auth/capture coverage per scheme; card settlement cadence/reserves/fees; production support SLA |
| PayTabs | Egypt-specific service/endpoint; hosted checkout; EGP examples; authorization/capture; signed IPN/callback plus query; five IPN retries; linked refund API; persistent test profile; local-currency settlement and dashboard support | Enabled Egyptian card schemes and auth/capture per scheme; event identity/deduplication contract; refund timing and original-rail confirmation for ordinary cards; Egypt-specific hold days, reserves, fees, and payout thresholds; contractual SLA |

## Provider detail

### Paymob

#### Documented capabilities

- Paymob publishes an Egypt regional base URL, standard online card payments with 3-D Secure, hosted checkout, an embedded Pixel checkout, and separate test/live credentials. Its documentation estimates hosted checkout as a medium-complexity integration and says Paymob handles sensitive card data; EGP appears in its official transaction callback example. ([integration overview](https://developers.paymob.com/paymob-docs/developers/quicklink-apis/overview), [checkout experiences](https://developers.paymob.com/paymob-docs/developers/checkout-experiences), [EGP transaction callback](https://developers.paymob.com/paymob-docs/developers/webhook-callbacks-and-hmac/hmac/hmac-transaction-callback))
- A Payment Intention carries amount, currency, payment-method integrations, a merchant `special_reference`, an expiration, and a notification URL. The response returns Paymob order/intention IDs and a checkout client secret. These identifiers can correlate a FindEg Payment Attempt without exposing card data. ([Create Intention](https://developers.paymob.com/paymob-docs/developers/intention-apis/create-intention))
- Paymob says backend callbacks, rather than the browser redirect, are the source of truth for final status. Transaction callbacks can be verified with HMAC-SHA-512 over documented fields, including transaction ID, order ID, amount, currency, success, authorization, capture, refund, and void flags. ([API integration flow](https://developers.paymob.com/paymob-docs/integration-paths/apis), [HMAC transaction callback](https://developers.paymob.com/paymob-docs/developers/webhook-callbacks-and-hmac/hmac/hmac-transaction-callback))
- The platform documents authorization/capture as a two-step flow that reserves funds and collects later. The public overview does not state the Egyptian authorization lifetime or scheme-by-scheme availability. ([core features](https://developers.paymob.com/paymob-docs/payments-and-features/core-features))
- Full and partial refunds are tied to an original successful transaction, and Paymob explicitly states that the refunded amount goes back to the same payment method. Refunds are supported for all documented payment methods except kiosk payments. ([refunds](https://developers.paymob.com/paymob-docs/developers/manage-payment-apis/refund))
- Paymob offers a webhook testing tool that captures payment, refund, void, and capture callbacks. Public docs direct developers to `support@paymob.com` and a developer community. ([webhook testing tool](https://developers.paymob.com/paymob-docs/developers/webhook-callbacks-and-hmac/webhook-testing-tool), [support](https://developers.paymob.com/paymob-docs/need-help/faq/test-credentials))

#### Trade-offs and unknowns

- The public callback documentation establishes authenticity and payload shape, but not retry count, retry timing, acknowledgement requirements, replay controls, duplicate-delivery behavior, or an availability objective. Those are blocking commercial/technical questions for a reliable payment integration.
- Public documentation reviewed for this note does not publish Egypt-specific card settlement timing, reserves, payout thresholds, fee/tax details, refund timing, or a support SLA.
- Authorization/capture is promising if FindEg later decides to reserve funds before capture, but Paymob must confirm the authorization window, partial-capture/void rules, and support for every phase-one Egyptian card scheme.
- For a small team, hosted checkout plus the Intention API is the narrowest documented integration surface. That reduces card-data handling, but it does not remove the need for FindEg-owned webhook idempotency, reconciliation, and support procedures.

### Amazon Payment Services

#### Documented capabilities

- APS says it is available to merchants in Egypt, requires a registered company, and accepts credit/debit cards. Its Egypt/Meeza material says merchants can accept local and international cards; its payment-method matrix lists Visa and Mastercard globally and Meeza in Egypt/EGP. ([merchant FAQ](https://paymentservices.amazon.com/support-center/faq?kw=general), [Egypt/Meeza](https://paymentservices.amazon.com/meeza), [payment methods](https://paymentservices.amazon.com/docs/payment-methods/payment-methods-support))
- Hosted Checkout supports `PURCHASE` for immediate capture and `AUTHORIZATION` for an auth-only transaction. The merchant reference must be unique per merchant, and hosted checkout keeps payment data on APS. ([Hosted Checkout API](https://paymentservices.amazon.com/docs/api/accepting-payments/hosted-checkout), [Hosted Checkout overview](https://paymentservices.amazon.com/docs/accepting-payments/hosted-checkout/overview))
- An authorization holds funds without transferring them; APS says capture normally must happen within five to seven days. Meeza is an important exception: it is EGP-only and does not support the `AUTHORIZATION` command. ([capture](https://paymentservices.amazon.com/docs/managing-payments/capturing-payment), [Meeza](https://paymentservices.amazon.com/docs/payment-methods/local-payment-methods/meeza))
- APS separates immediate Transaction Feedback from Notification Feedback for later capture, refund, and delayed changes. It requires HTTPS and response acknowledgement, signs responses, says it retries failed webhooks, tells merchants to handle duplicates idempotently, and provides Check Status as a fallback. Public guidance does not state the retry count or schedule. ([webhooks](https://paymentservices.amazon.com/docs/managing-payments/tracking-a-payment/webhooks), [webhook/idempotency guidance](https://paymentservices.amazon.com/docs/api/faqs/faq), [Check Status](https://paymentservices.amazon.com/docs/api/managing-payments/check-status))
- The refund API supports full or partial refund of a captured transaction and uses the original merchant reference. The public API page does not use unambiguous “original payment method” wording, so that behavior should be confirmed in the Egyptian merchant agreement. ([Refund API](https://paymentservices.amazon.com/docs/api/managing-payments/refund), [refund workflow](https://paymentservices.amazon.com/docs/managing-payments/refunding-payment))
- APS provides sandbox endpoints, region-specific test cards including Meeza, and a Postman collection covering authorization, capture, refund, and status operations. It publishes merchant and integration support email addresses. ([test cards](https://paymentservices.amazon.com/docs/developer-resources/test-cards), [Postman collection](https://paymentservices.amazon.com/docs/developer-resources/postman-collection), [API reference/support](https://paymentservices.amazon.com/docs/api))
- APS says hosted or non-PCI custom integrations keep card data away from the merchant server. Its generic merchant FAQ says settlement is in the company's local currency or USD, normally takes one to two weeks depending on the bank agreement, and live-account onboarding usually takes 20–30 days after all documents are supplied. These are generic public figures, not an Egyptian offer. ([PCI compliance](https://paymentservices.amazon.com/docs/security/pci-compliance), [merchant FAQ](https://paymentservices.amazon.com/support-center/faq?kw=general))

#### Trade-offs and unknowns

- APS has the most explicit public onboarding and generic settlement statements in this shortlist, but the actual Egyptian acquirer, pricing, reserve, settlement day, minimum payout, and tax treatment remain contractual.
- Its documentation explicitly anticipates duplicate webhook delivery and requires merchant-side idempotency. It does not publish the webhook retry count, backoff, retention, manual replay capability, or service-level objective.
- If FindEg wants authorization/capture, it cannot assume one flow for every card: Meeza requires direct purchase. This may require a scheme-aware payment flow or immediate capture for all phase-one cards.
- Refund linkage is documented, but FindEg should obtain written confirmation of original-rail behavior, timing by card scheme, failure handling, and whether a low merchant balance can delay a refund.

### FawryPay

#### Documented capabilities

- FawryPay presents itself as an Egyptian online payment processor. Its server API documentation lists Visa and Mastercard credit/debit cards plus Meeza, and its card request examples use EGP. ([online payments introduction](https://developer.fawrystaging.com/public/docs/introduction), [server APIs](https://developer.fawrystaging.com/public/docs/server-apis/server-apis-overview), [card payment API](https://developer.fawrystaging.com/docs/server-apis/create-payment-card-apis))
- FawryPay Express Checkout returns a provider-hosted redirect URL. A charge can include a merchant reference, order items, `paymentExpiry`, an order webhook URL, a card-only payment method, and `authCaptureModePayment`. This is compatible with correlating a FindEg Payment Attempt and aligning checkout expiry with—but not delegating—the application Inventory Hold timeout. ([hosted checkout](https://developer.fawrystaging.com/public/docs/express-checkout/fawrypay-hosted-checkout))
- FawryPay documents authorize, later capture, and cancellation. It says authorization holds funds and recommends capture within the card's “honor period,” while warning that capture remains subject to risk and available funds; the period is not publicly quantified. ([authorization and capture](https://developer.fawrystaging.com/docs/server-apis/auth-capture-payment-apis), [server API overview](https://developer.fawrystaging.com/public/docs/server-apis/server-apis-overview))
- Notification V2 sends a server-to-server POST whenever transaction status changes. It includes a UUID `requestId`, merchant and Fawry references, status, amounts, and an SHA-256 message signature. FawryPay marks delivery on HTTP 200 and otherwise retries a preconfigured number of times. A signed Get Payment Status V2 API provides reconciliation fallback. The public docs do not state the retry count, schedule, retention, or replay mechanism. ([Notification V2](https://developer.fawrystaging.com/docs/server-apis/payment-notifications/server-notification-v2), [Get Payment Status V2](https://developer.fawrystaging.com/docs/sdks/payment-notifications/get-payment-status-v2))
- The refund API supports full or partial refund of captured payments and rejects refund amounts above the paid amount. It is keyed by the Fawry order reference and SHA-256 signature. The docs say funds are refunded to the customer but do not explicitly promise return through the original payment rail. ([Refund API](https://developer.fawrystaging.com/public/docs/server-apis/refund-issue-api))
- FawryPay publishes a staging environment and test cards for successful, rejected, and 3-D Secure scenarios. Its hosted or client-side tokenization paths avoid collecting raw card data in a non-PCI merchant application, and Fawry publishes a PCI DSS 4.0.1 compliance attestation. ([end-to-end testing](https://developer.fawrystaging.com/docs/testing/testing), [card tokenization](https://developer.fawrystaging.com/docs/card-tokens/create-use-token), [PCI DSS 4.0.1 attestation](https://www.fawry.com/wp-content/uploads/2025/03/PCI_DSS_v4-0-1_COC_Fawry_2025.pdf))

#### Trade-offs and unknowns

- Callback URLs may be supplied per hosted order, but the general Notification V2 documentation also says the merchant callback is configured with the FawryPay operations team during account setup. FindEg should confirm which model applies to its chosen integration and how quickly endpoints can be changed. ([hosted checkout](https://developer.fawrystaging.com/public/docs/express-checkout/fawrypay-hosted-checkout), [Notification V2](https://developer.fawrystaging.com/docs/server-apis/payment-notifications/server-notification-v2))
- The retry trigger is documented, but exact retries, backoff, replay, duplicate-delivery behavior, and service-level objective are not. FindEg can key ingestion on `requestId`, but FawryPay should confirm its uniqueness and retention contract.
- Public materials reviewed here do not state ordinary online-card settlement cadence, reserves, payout thresholds, fees/taxes, refund completion time, or a production support SLA.
- The hosted path is appropriate for a small team; the raw server-to-server card endpoint is not, because FawryPay says a merchant collecting raw card details must be fully PCI compliant. ([card payment API](https://developer.fawrystaging.com/docs/server-apis/create-payment-card-apis))

### PayTabs

#### Documented capabilities

- PayTabs operates an Egypt-specific service, advertises online acceptance of globally accepted cards and settlement in local currency, and publishes an Egypt-specific API domain. EGP transaction samples appear in its payment-response documentation. ([PayTabs Egypt](https://paytabs.com/en/egypt/), [Egypt API domain](https://docs.paytabs.com/manuals/PT-API-Endpoints/Integration-Types-Manuals/Hosted-Payment-Page/HPP-Step-7-Manage-Transactions/HPP-Step-7-Void-Transaction/), [EGP callback sample](https://docs.paytabs.com/manuals/PT-API-Endpoints/Integration-Types-Manuals/Invoices-APIs/Invoices-Step-6-Handle-post-payment-responses/Invoices-Step-6-Landing/))
- Hosted Payment Page is available to merchants without their own PCI certification. PayTabs supports `sale` and `auth`; a later capture uses the original `tran_ref`. Public docs say an authorization usually remains on hold at the issuing bank for seven to fourteen days, after which an uncaptured/unvoided hold is released. ([Hosted Payment Page](https://support.paytabs.com/en/support/solutions/articles/60000992876-3-2-1-hosted-payment-page-apis-initiating-the-payment), [capture](https://docs.paytabs.com/manuals/PT-API-Endpoints/Integration-Types-Manuals/Invoices-APIs/Invoices-Step-7-Manage-Transactions/Invoices-Step-7-Capture-Transaction/), [void](https://docs.paytabs.com/manuals/PT-API-Endpoints/Integration-Types-Manuals/Hosted-Payment-Page/HPP-Step-7-Manage-Transactions/HPP-Step-7-Void-Transaction/))
- A per-payment callback is a one-time server-to-server result sent after checkout. For stronger event coverage, configurable IPN sends on selected transaction events, retries non-200 delivery up to five times with increasing delay, and records exhausted attempts. PayTabs also exposes Query Transaction. Its response-handling documentation requires signature verification. ([callback](https://docs.paytabs.com/manuals/PT-API-Endpoints/Integration-Types-Manuals/Request-Response-Parameters/Request-Response-Callback/), [IPN retry behavior](https://support.paytabs.com/en/support/solutions/articles/60000710069), [response mechanisms/query](https://support.paytabs.com/en/support/solutions/articles/60000687835-what-are-the-five-5-ways-of-receiving-transaction-response-), [signature verification requirement](https://docs.paytabs.com/manuals/PT-API-Endpoints/Integration-Types-Manuals/Invoices-APIs/Invoices-Step-6-Handle-post-payment-responses/Invoices-Step-6-Landing/))
- Refund requests are follow-up transactions against a successful sale or capture and return funds to the customer's bank account; the original `tran_ref` is required. Public generic docs do not establish Egypt-specific refund timing or unambiguously state original-card-rail behavior for every scheme. ([refund transaction](https://docs.paytabs.com/manuals/PT-API-Endpoints/Integration-Types-Manuals/Invoices-APIs/Invoices-Step-7-Manage-Transactions/Invoices-Step-7-Refund-Transaction/))
- Every merchant receives a separate test profile, which remains available after the live profile is created. PayTabs publishes cards for successful/rejected and 3-D Secure simulations and exposes integration/debug logs in the dashboard. ([test versus live profiles](https://support.paytabs.com/en/support/solutions/articles/60000710008-what-is-test-profile-vs-live-profile-), [test cards](https://support.paytabs.com/en/support/solutions/articles/60000712315-what-are-the-test-cards-available-to-perform-payments-), [developer dashboard](https://support.paytabs.com/en/support/solutions/articles/60000679485-developers-menu-via-merchant-dashboard))
- PayTabs states that it is PCI DSS Level 1 certified and that hosted checkout avoids requiring the merchant's own PCI certificate. The Egypt page publishes tiered pricing, while the dashboard documentation shows configurable payout schedules, pending/available balances, reserves, and reports. Those pages describe product mechanics, not FindEg's final contract. ([PCI requirements](https://support.paytabs.com/en/support/solutions/articles/60000709976-what-is-pci-dss-and-what-are-the-merchant-requirements-), [Egypt product/pricing](https://paytabs.com/en/egypt/), [accounts and payouts](https://support.paytabs.com/en/support/solutions/articles/60001048862-accounts-menu-via-merchant-dashboard))
- The public contact page lists Egypt support hours and a target response window for contact requests, but it is not a contractual availability or incident SLA. ([contact/support](https://paytabs.com/en/contact/))

#### Trade-offs and unknowns

- PayTabs has the most explicit retry count in the shortlist, but FindEg should use configurable IPN rather than assume the one-time checkout callback is retried. The public docs do not define a globally unique event ID or provider-side deduplication contract; FindEg still needs idempotent ingestion by transaction reference plus event/status.
- The Egypt page establishes the market and local settlement, but card scheme coverage—including Meeza—auth/capture availability, hold days, reserves, payout thresholds, exact fees/taxes, and refund timing must be confirmed for FindEg's merchant profile.
- Generic public pricing is useful for initial framing but is not a substitute for a dated Egyptian commercial proposal.
- Hosted checkout, retained test profiles, query fallback, and documented Node/backend packages reduce integration burden for a small team. They do not remove the operational need to reconcile exhausted IPNs and uncertain payments.

## Provider-neutral implication for FindEg's payment and stock flow

The following is a design inference from the provider evidence, not a capability promised by any provider:

1. In one FindEg transaction, validate current price/availability, create an expiring Inventory Hold, and create a Payment Attempt with a unique merchant reference. The Inventory Hold must be owned by FindEg and have a short, explicit `expiresAt`.
2. Create the provider payment/intention using that unique reference and the exact EGP amount, then redirect to a hosted checkout. Never trust the browser return as payment confirmation.
3. Receive authenticated server notifications into a durable inbox. Deduplicate on a provider event/request identifier when one is contractually unique; otherwise use provider transaction ID plus event/status. Apply only valid, monotonic Payment Attempt state transitions.
4. On authenticated success, atomically mark the Payment Attempt paid, accept the Order, and convert the Inventory Hold into an Order Reservation, preserving payment and stock integrity. On terminal failure/cancel or local timeout, release the Inventory Hold.
5. Query the provider when a notification is missing or an API call times out. A late success after the local stock hold expired must enter an explicit exception path—re-reserve if possible, otherwise refund and alert operations—rather than silently oversell.
6. Authorization/capture is optional and distinct from the Inventory Hold. It can reserve customer funds while FindEg performs a last availability check, but adds scheme-specific rules, expiration, capture/void operations, and failure states. Immediate purchase plus a short FindEg Inventory Hold is the simpler baseline unless a later decision justifies auth/capture.

This shape keeps payment-provider behavior behind a small application port: create checkout, verify/ingest notification, query status, refund, and—only if selected—capture/void. It also makes the provider choice more reversible for an agent-assisted team.

## Questions that must be answered before selection

Ask every provider for written answers against the same test case and expected monthly volume:

### Acceptance and onboarding

- Can this Egyptian legal entity accept EGP Visa, Mastercard, and Meeza online? Which debit, prepaid, international, and 3-D Secure variants are enabled by default?
- What KYC documents, prohibited-business checks, underwriting time, integration certification, minimum term, setup fee, and go-live steps apply?

### Payment semantics

- Is immediate purchase supported for every phase-one card scheme?
- If authorization/capture is considered: which schemes support it, how long is the authorization valid, are partial capture and multiple capture supported, and what are the void/expiry semantics?
- Is the merchant reference unique and enforced? Does retrying the same create-payment request return the original result, reject it, or risk another charge?

### Notifications and reconciliation

- Which success, failure, cancel, authorization, capture, void, refund, chargeback, and settlement events are emitted?
- What authenticates each notification? How are secrets rotated?
- What event ID is globally unique, how long is it retained, and can duplicate or out-of-order events occur?
- What are the retry count, backoff, acknowledgement timeout, retention period, manual replay tools, delivery dashboards, and service-level objective?
- Is there a query/status API and a transaction/reconciliation export independent of webhooks?

### Refunds

- Do full and partial refunds always return to the original card/payment rail? What happens when the card is expired, replaced, closed, or the refund fails?
- What API permissions, merchant-balance requirements, approval workflow, fees, cutoffs, and cardholder completion times apply?
- Are refund status changes notified and queryable?

### Settlement and commercial terms

- What is the EGP settlement bank, hold period, payout schedule, minimum payout, rolling reserve, chargeback reserve, settlement report format, and reconciliation key?
- What are the transaction, fixed, refund, chargeback, setup, monthly, payout, cross-border, foreign-card, and tax fees?
- Which terms are configurable per merchant, and what notice applies to changes?

### Security and operations

- Supply the current PCI DSS Attestation of Compliance, hosted-checkout SAQ guidance, 3-D Secure version/behavior, data-processing terms, data location/subprocessors, key-management controls, audit logs, and vulnerability-reporting process.
- What uptime, incident notification, status page, maintenance, support hours, response/resolution targets, and production escalation path are contractual?
- Can FindEg test success, decline, cancel, 3-D Secure challenge/failure, timeout/uncertain result, duplicate/out-of-order webhook, refund, auth/capture/void, and exhausted retries before go-live?

## Conclusion

The public evidence keeps all four providers on a credible shortlist, but for different reasons and with different gaps:

- Paymob has a clear Egypt-oriented hosted/intention flow, authenticated source-of-truth callbacks, and the strongest explicit same-payment-method refund statement. Its public retry, settlement, and SLA evidence is incomplete.
- APS has a mature hosted/API surface, explicit duplicate-safe webhook guidance and status fallback, published generic onboarding/settlement expectations, and a documented Meeza path. Its auth/capture flow is not uniform because Meeza cannot authorize, and the final Egyptian commercial terms remain unknown.
- FawryPay has direct Egyptian scheme coverage, hosted checkout, explicit non-200 notification retries, status query, and strong local testing/security evidence. Retry parameters, original-rail refund wording, settlement, and support terms need confirmation.
- PayTabs has an Egypt-specific product, explicit IPN retry count, retained test profiles, query fallback, and visible settlement tooling. Its merchant-profile scheme coverage and Egypt-specific commercial, refund, and event-identity details need confirmation.

No provider should be chosen from public documentation alone. The next decision can compare dated written responses and a sandbox proof against the common checklist above without changing FindEg's provider-neutral payment and stock model.

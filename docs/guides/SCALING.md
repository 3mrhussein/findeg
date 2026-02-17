# Scaling Guide

This guide covers how to grow the codebase without degrading clean architecture.

## 1. Structural Scaling

- Keep feature ownership clear (`catalog`, `cart`, `order`, `identity`, `administration`, `review`, `media`).
- Place shared cross-cutting logic in `src/features/core`.
- Avoid cross-feature infrastructure imports; depend on contracts/interfaces.

Reference: `docs/architecture/ARCHITECTURE_PLAYBOOK.md`.

## 2. Service Scaling

- Split large services by use case boundaries (search, pricing, checkout, import).
- Keep orchestration in application layer.
- Keep persistence mapping inside infrastructure repositories.

## 3. API Scaling

- Maintain clear route ownership under `/api/v1/*`.
- Keep request/response schemas explicit with zod.
- For MVP, evolve contracts quickly but update all in-repo clients in the same change.

## 4. Data Scaling

- Keep taxonomy deterministic and admin-managed.
- Continue migration-driven schema changes; no ad hoc production edits.
- Preserve order/cart snapshots to keep historical consistency.

## 5. Operational Scaling

- Add integration tests for critical flows first (cart, checkout, admin inventory updates).
- Track high-risk metrics (pricing resolution failures, checkout failure rate, import validation errors).
- Keep audit logging on all admin mutations.

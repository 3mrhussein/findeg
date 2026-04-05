# Review Feature

Owns product feedback lifecycle: submission, moderation state, and rating aggregation inputs.

## Use Cases

```mermaid
flowchart LR
    Customer --> UC1[Submit review]
    Admin --> UC2[Approve/reject review]
    Catalog --> UC3[Display rating summary]
```

## UML (Class View)

```mermaid
classDiagram
    class Review
    class IReviewRepository
    class DrizzleReviewRepository

    DrizzleReviewRepository ..|> IReviewRepository
    IReviewRepository --> Review
```

## Sequence (Create Review)

```mermaid
sequenceDiagram
    participant API as Product Review Endpoint
    participant Repo as IReviewRepository
    API->>Repo: create(review payload)
    Repo-->>API: persisted review
    API-->>Client: success response
```

## Layer Notes
- `domain`: `Review` entity and validation boundaries.
- `application`: review repository contract.
- `infrastructure`: Drizzle repository implementation.

## Clean Architecture Boundaries
- Depends on `catalog` and `identity` IDs, not their infrastructure adapters.
- Rating aggregation consumed by catalog views.


# Review Feature

The `review` feature allows customers to provide feedback and ratings for products they've purchased.

## Responsibilities

- **Product Feedback**: Submitting star ratings and text comments for products.
- **Review Moderation**: Administrative capability to approve or hide reviews.
- **Rating Aggregation**: Computing average ratings and review counts for the catalog.

## Component Overview

### Domain Layer (`/domain`)

- **Entities**: `Review`.

### Application Layer (`/application`)

- **Ports**: `IReviewRepository` and `IReviewService`.

### Presentation Layer (`/presentation`)

- **Components**: Review lists, Rating summaries, and Submission forms.

## Architectural Boundaries

- **Depends On**: `catalog` (associated products), `identity` (reviewer association).
- **Communication**: Aggregated ratings are consumed by the `catalog` feature for display in product cards.

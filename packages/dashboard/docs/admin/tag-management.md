# Tag Management Documentation

## Overview

Tags in FindEg.com are used to provide flexible categorization and attributes to products beyond the main category tree. They are organized into **Groups** (e.g., `style`, `audience`, `seasonality`).

## Technical Model

Previously, tags contained localized labels and descriptions in the database. These have been removed to simplify the model and avoid redundancy.

- **Identifier**: A tag is uniquely identified by its `group:key` combination.
- **Slug**: used for URL routing.
- **Storefront Display**: Resolved via a static mapping in `src/features/catalog/presentation/config/tag-display.ts`.

## Admin Management

Admins can manage tags via the **Catalog > Tags** section in the dashboard.

- **Group**: The namespace for the tag.
- **Key**: The unique identifier within that group.
- **Slug**: Automatically generated from the key.
- **Icon/Color**: Visual properties for display in the admin panel and potentially the storefront.

## Storefront Display Configuration

To change how a tag is displayed to customers, update the `TAG_DISPLAY_MAP` in `src/features/catalog/presentation/config/tag-display.ts`:

```typescript
export const TAG_DISPLAY_MAP = {
  "group:key": { en: "English Label", ar: "الاسم بالعربي" },
  // ...
};
```

If a tag is not present in the map, it will fallback to a title-cased version of its key.

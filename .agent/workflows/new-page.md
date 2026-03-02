---
description: Standards for implementing a new shop or listing page
---

# Creating a New Page

Follow these steps to implement a new page in the FindEg storefront.

## 1. Prepare Data (ViewModel)

Never fetch data directly in the page component. Create a ViewModel in `src/features/catalog/application/queries/`.

- **Input**: Locale, Slugs, SearchParams.
- **Output**: A flat object matching the needs of the view.
- **Shared Utils**: Reuse `src/features/catalog/application/queries/listing.ts` for filtering and option building.

## 2. Page Structure (UI)

Every storefront page must follow this pattern:

```tsx
import { Suspense } from "react";
import { PageShell } from "../_components/PageShell";
import { setRequestLocale } from "next-intl/server";

export default function MyNewPage({ params }) {
  return (
    <Suspense fallback={<StandardSpinner />}>
      <MyNewPageContent params={params} />
    </Suspense>
  );
}

async function MyNewPageContent({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 1. Fetch ViewModel
  const vm = await getMyNewPageViewModel(locale, ...);

  // 2. Render using shared layouts
  return (
    <PageShell>
      {/* 3. Use ProductListingLayout if it's a list */}
      <ProductListingLayout {...vm} />
    </PageShell>
  );
}
```

## 3. i18n

1. Open `src/features/core/infrastructure/cms/messages/en.json` and `ar.json`.
2. Add a new section under `"Pages"`:
   ```json
   "MyNewPage": {
     "Title": "...",
     "Description": "..."
   }
   ```
3. Use the scoped namespace:
   ```tsx
   const t = await getTranslations({ locale, namespace: "Pages.MyNewPage" });
   ```

## 4. Quality Checklist

- [ ] No `as any` casts.
- [ ] No hardcoded English strings.
- [ ] Imports grouped at the top.
- [ ] Uses `<PageShell>`.
- [ ] `npm run type-check` passes.

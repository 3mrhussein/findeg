# Storefront School Data

Reads for the Partner School directory (`/schools`, `/schools/[slug]`), backed by
`createSchoolDirectory()` from `@findeg/backend/features/school`.

- `getSchoolFilterOptions` is cached; `searchSchools` and `getSchoolProfile` are not, so list status
  changes (publish, archive, replace) show immediately. They read active Partner Schools and
  their profiles. The profile `slug` is the school's Business Partner code.
- A profile lists the school's **published** School Supply Lists only, each linking to
  `/lists/<publicCode>`. Archived and draft lists never appear.
- A list itself is opened live by its public code (`/lists/[publicCode]`) and is never cached here.
  Possession of the code is the only gate: there is no login wall, token or access request.

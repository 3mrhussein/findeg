# Business modules

The eight owners and their public/construction boundaries are defined in
[package guidance](../../../docs/package-guidance.md). Add behavior under its
owner here. Legacy `src/features` is replacement evidence, not a target dependency.

Public `contracts.ts` contains database-free types; `public.ts` exposes application
operations. Concrete adapter factories stay in `infrastructure/`. Ownership does
not require placeholder business operations before the corresponding ticket lands.

---
status: accepted
---

# The Business Domain Schema is a dependency-free leaf package, separate from the database

Domain values such as order statuses, partner roles and school lists were declared in several layers and drifted apart (the frontends re-typed them, and the database and backend held different sets). We decided that `@findeg/schema` is the one place these values are declared, and that it is a leaf: it depends only on `zod`, never on Drizzle, the database, a workspace package or Node. `db` derives its enums and constraints from it, so Drizzle tables stay in `db`, and the frontends can import it directly into client bundles.

# Research: Backend Architectural Refactoring (Phase 1)

## Decision: Direct DB Query Functions in @findeg/db

**Rationale**:
To adhere to Clean Architecture, the Application layer (services) should not have a direct dependency on the Infrastructure layer (Drizzle/SQL). However, creating repositories for complex, one-off analytics queries can lead to interface bloat. 
By moving these queries to a dedicated `db/queries` module within the `@findeg/db` package, we achieve:
1. **Decoupling**: Services no longer import `drizzle-orm` or `@findeg/db/schema`.
2. **Centralization**: All complex SQL/Drizzle logic is in one place, easier to optimize (e.g., using `sql.raw` or specialized joins).
3. **Reusability**: These functions can be used by other features if needed.

**Alternatives Considered**:
- **Option A: Full Repository Pattern**: Rejected for Phase 1 to keep changes minimal and avoid excessive boilerplate for analytics-only reads.
- **Option B: Query Classes in Backend (Selected)**: Query classes in the Application layer provide a clean place for mapping logic (e.g., localized names) while keeping the service focused on orchestration.

## Decision: Selective CQRS for Dashboard

**Rationale**:
The `AdminDashboardService` is currently overloaded with both simple CRUD-like aggregations (e.g., `productRepository.count()`) and complex, multi-table joins. 
Splitting the complex reads into "Query" classes allows:
1. **Separation of Concerns**: Orchestration (Service) vs. Data Retrieval/Mapping (Query).
2. **Testability**: Query classes can be mocked or tested in isolation.
3. **Maintainability**: The service remains clean and focused on high-level KPIs.

## Technology Best Practices (Drizzle)
- Use `sql<number>` for aggregations to ensure type safety in the database layer.
- Use `leftJoin` and `groupBy` carefully to avoid performance bottlenecks.
- Use `cast(count(*) as integer)` for cross-DB compatibility (especially with PG).

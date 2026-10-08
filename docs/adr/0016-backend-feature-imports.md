---
status: accepted
---

# Backend features use public entry points

Order reads and Staff transitions previously reached across feature internals, allowing duplicate mappers and an audit write outside the lifecycle transaction. Backend features now import each other through their root barrels or explicitly exported public entry points. ADR-0001's client-safe schemas remain separate; pure money, errors and transactional Outbox producers also have narrow public entries so consumers do not load unrelated session adapters or the global database.

ESLint checks relative and package-alias imports into application, domain, infrastructure and flat implementation files. A feature may import its own implementation. Existing violations outside Order are allow-listed by exact importing file and import path; adding an exception requires a deliberate architectural change. Order has no exceptions. Package extraction remains a separate change after the Order interface and dependencies stabilize.

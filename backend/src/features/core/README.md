# Core infrastructure

Core owns JWT and cookie transport, request-cookie adapters, logging, storage/cache
ports, service-result metadata and infrastructure errors. Session infrastructure
accepts an injected identity resolver; Identity owns account eligibility, permissions
and session payload contracts. Catalog owns locale/translation adapters.

Core no longer publishes Domain or schema compatibility facades. Consumers import
context contracts from their owning package. Infrastructure entries are listed in
[ADR-0020](../../../../docs/adr/0020-domain-single-source-and-bounded-context-packages.md).

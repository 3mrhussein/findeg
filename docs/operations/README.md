# Operational expectations

This is the canonical phase-one runbook baseline. It describes required
operational behavior before target certification; it does not assert that every
legacy executable already provides it.

- Web, worker, and migrations start from explicit runtime composition and
  process-scoped validated configuration.
- Web and worker releases use the same revision and may restart independently.
- Migrations run through the single ordered PostgreSQL migration history before
  an application revision needing them receives traffic.
- Transactional outbox delivery occurs after commit, uses stable delivery IDs,
  retries failures, and retains exhausted failures for investigation.
- Production notification delivery fails closed until a configured, validated
  provider adapter exists. Development/test may use an explicit local sink.
- Deployments must expose structured logs and health/readiness signals for web,
  worker, database connectivity, and undelivered outbox work.
- Rollback never rewrites accepted Orders, reservations, or reward accounting;
  it uses forward corrective records or a compatible application revision.

The implementation-level commands and provider-specific procedures belong next
to the owning runtime adapter when that adapter is introduced.

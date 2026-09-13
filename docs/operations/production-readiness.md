# Production readiness and certification

Issue #63 establishes the gates; a green build alone is not production approval.
The current production delivery configuration deliberately fails closed. No
production certification is possible until a reviewed provider implementation,
sender configuration and controlled delivery evidence exist.

## Blocking gates and evidence

The Quality workflow runs the same `pnpm quality:check` used locally: production
compilation/build, lint, architecture and browser/server import restrictions,
OpenAPI contracts, type generation, strict type checks, domain/application suites,
process startup/restart, real PostgreSQL migration/replay and workflow tests, and
Cypress Arabic/English critical journeys. PostgreSQL is disposable; tests must
never point at a shared or production database. Preserve Cypress failure artifacts.
The Release artifact gate builds the shared Docker image and imports its compiled
runtime entry points. `pnpm security:check` separately rejects high/critical production dependency
advisories and fails if the advisory service is unavailable.

Configure branch protection on `develop` and `main` to require **Quality gate**,
**Security gate**, **Documentation gate** and **Release artifact gate**, disallow bypass, and require review.
An administrator must verify those settings; repository YAML cannot enforce
branch protection by itself. Do not retire the target's predecessors under #64
until the certification run and all evidence below are approved.

To request certification, dispatch Quality on the exact candidate revision with
`certify=true`. The workflow first checks that the `production-certification`
environment has required reviewers, prevents self-review and disables admin
bypass. Missing configuration or unreadable settings block certification. Create
that environment before use and provide a read-only `CERTIFICATION_READ_TOKEN`
with repository environment read access for the protection check. Limit permitted
deployment branches to `main` and `develop`. Never expose this token to PR jobs.
The protected certification job requires a reviewer to inspect a release record
linked by `evidence_url`, covering all of:

- Security: dependency results, session/portal isolation, least-privilege database
  and deployment access, TLS, secret rotation, payload redaction and provider validation.
- Migration: SQL review, backup identifier, restore rehearsal, clean migration and
  replay, previous-revision compatibility, measured duration and locking impact.
- Documentation: matching ADR, OpenAPI, package guidance and runbooks; operational
  commands rehearsed against this revision and all known limitations recorded.
- Release: immutable image digest, web/worker revision match, staging journey run,
  database/worker readiness, rollback drill, capacity calculation, monitoring and
  named on-call owner. Record reviewer identity, date and evidence per gate.

Reject approval when any item is missing or failed. An approval for a prior SHA
is not reusable. Certification emits a revision-bound receipt only after every
job passes and production worker configuration validates. It does not deploy.

## Schema migration, release and rollback

1. Freeze a full Git SHA and build `Dockerfile.runtime` once using
   `RELEASE_REVISION`. Store the image digest and previous working digest in the
   release record; web, worker and migrations all use that image.
2. In isolated staging, restore a recent encrypted backup and run `pnpm migrate`
   from the candidate image. Replay it, inspect constraints and migration history,
   and run the critical journeys. Review destructive changes and long locks.
   Prove both old and new application compatibility during rolling replacement;
   otherwise schedule a maintenance window and stop traffic and workers first.
3. Confirm a restorable production backup/PITR point and an owner for rollback.
   Run exactly one migration process (`docker compose -f compose.runtime.yml run
--rm migrate`) with the database credentials and verified TLS configuration.
   A nonzero exit stops the release; investigate before restarting migration.
4. Start web and worker from the recorded image. Check `/health/live` revisions,
   worker `/health/ready`, an authenticated database-backed operation, and a
   controlled notification. Route traffic only after these checks pass. Never
   set production to development to bypass delivery validation.
5. Watch error rate, latency, checkout rejection changes, database connections,
   queue age and exhausted deliveries throughout rollout. Stop on regression.
   Roll back to the previous immutable application image only if it is compatible
   with the current schema. Otherwise stop traffic and apply a reviewed forward
   fix. Do not reverse accepted Orders or rewrite append-only accounting.

## Recovery and monitoring

Target monthly availability is 99.5%. Operational recovery objectives are RPO
15 minutes and RTO 4 hours; these are targets requiring measured restore evidence,
not claims about an unconfigured hosting provider. Enable encrypted backups and
PITR in a separate failure domain; rehearse restore quarterly and before risky
migrations. Record actual loss window and restore duration. Recover into an
isolated database, validate migration history and commercial/outbox invariants,
then switch credentials/traffic deliberately. Reconcile provider delivery IDs
before replaying restored outbox work to avoid duplicate notifications.

Probe web and worker liveness each minute and worker readiness independently.
Alert on 5 consecutive failed probes, any exhausted delivery, oldest undelivered
work older than 5 minutes, database connections above 80% of the allocated budget,
and sustained 5xx above 1% for 5 minutes. Tune thresholds from measured traffic.
Route alerts to the named on-call operator. Use restricted queue metadata queries
from the outbox runbook; do not log payloads, addresses, codes, cookies or secrets.
Web liveness alone does not test the database: include a synthetic database-backed
catalog read and a controlled checkout/notification in staging after each release.

On worker failure, inspect readiness and safe queue metadata, correct the cause,
then restart only the worker. Let the 60-second claim lease expire after a crash.
Use the [investigated exhausted-delivery retry](outbox-delivery.md#retries-and-recovery)
procedure with an incident record; never bulk-reset attempts. Keep stable delivery
IDs. Expired Guest Order Access codes cannot be repaired by replaying messages.

## Connection budgets

Current pools allow 5 connections per web process, 2 per worker, and 1 per migration
process. Budget peak rolling-deployment instances, not only steady state:
`5 × peak web processes + 2 × peak workers + 1 migration + operator/monitoring reserve`.
Keep this below the database's usable limit after PostgreSQL/provider reserved
connections. Example: 4 peak web processes, 2 workers, 1 migration and 10 reserved
operational connections need 35 usable connections. Count each Node process and
any provider pooler limits; do not scale beyond the approved budget. Inspect
`pg_stat_activity` without copying query text or credentials into incident logs.

## Completed outbox cleanup

Retention defaults to no deletion. Obtain an approved retention window that covers
incident investigation and provider deduplication, then rehearse bounded batches
in staging. For example, after approval of 30 days, execute this transaction with
restricted operator access and record the affected row count, never payloads:

```sql
BEGIN;
WITH candidates AS (
  SELECT id FROM system.checkout_outbox
  WHERE status = 'delivered' AND delivered_at < now() - interval '30 days'
  ORDER BY delivered_at LIMIT 1000 FOR UPDATE SKIP LOCKED
), sink_cleanup AS (
  DELETE FROM system.notification_sink WHERE id IN (SELECT id FROM candidates)
)
DELETE FROM system.checkout_outbox WHERE id IN (SELECT id FROM candidates)
  AND status = 'delivered';
COMMIT;
```

Repeat with pauses under database load monitoring. Never delete pending,
processing or exhausted rows, or commercial idempotency outcomes. Keep Order,
reservation and reward accounting history intact. The Sink is local/test only;
production provider deduplication retention must be reviewed when adding its adapter.

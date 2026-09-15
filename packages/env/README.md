# Compatibility environment configuration

`@findeg/env` retains global environment parsing for prototype callers and database
authoring/fixture tools. It is not the configuration interface for target web,
worker, or migration processes. Those use process-scoped configuration composed
by `runtime`; see the [supported runbook](../../docs/operations/README.md).

Keep these exports while compatibility callers or retained tools import them.
Retire them after the last caller moves to explicit configuration and the target
migration/replay and application gates pass without this package, as recorded in
the [retirement register](../../docs/package-guidance.md#retained-compatibility-evidence-64).

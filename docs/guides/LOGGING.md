# Logging Guide

## Overview

FindEg uses dual logging:

- File logs for fast local/debug visibility
- Database logs for queryable operational history

## Core Components

- `LoggerService`: `src/features/core/application/services/LoggerService.ts`
- File adapter: `src/features/core/infrastructure/logging/FileLogger.ts`
- Request logging endpoint: `/api/v1/logging/request`
- Middleware/proxy emitter: `src/proxy.ts`

## Logging Principles

1. Keep logs structured (`requestId`, `userId`, `path`, `duration`, metadata).
2. Keep logging non-blocking for request paths.
3. Keep sensitive values sanitized.

## Usage

```ts
import { getServices } from "@server/getServices";

const { logger } = getServices();
logger.info("Processing order", { orderId: 123 });
```

## Operational Checks

- File logs: `logs/app.log`
- DB logs: inspect `server_logs` table (`npm run db:studio`)

## Notes

- Keep logging concerns in core/infrastructure; do not couple feature domain logic to logging implementations.
- Audit logs for admin mutations are separate from server request logs and remain mandatory for operational traceability.

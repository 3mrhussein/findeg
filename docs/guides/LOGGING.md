# 📝 Logging System Guide

## Overview

FindEg implements a robust, multi-tiered logging architecture designed for stability and depth of insight. The system captures both high-level application events and detailed server request logs without blocking the main application thread.

## Architecture

Our logging strategy is built on three key pillars:

1.  **Multi-Tier Persistence**: Logs are written to both the filesystem (for speed/reliability) and the database (for analysis).
2.  **Decoupled Execution**: Heavy logging operations are offloaded from critical paths (like Middleware) via a lightweight internal API.
3.  **Structured Metadata**: All logs include contextual data like `requestId`, `userId`, `duration`, and `method`.

### The `LoggerService`

The core of the system is the `LoggerService` (in `src/application/services/LoggerService.ts`), which coordinates:

- **File Logging**: Uses `winston` (via `FileLogger` adapter) to write rotated logs to `logs/app.log`.
- **Database Logging**: Inserts structured records into the `server_logs` table using Drizzle ORM.

## Usage

### 1. Basic Logging (Application Service)

Inject `ILoggerService` into your services or use the global container:

```typescript
import { getServices } from "@/server/getServices";

export async function myBusinessLogic() {
  const { logger } = getServices();

  logger.info("Processing order", { orderId: 123 });

  try {
    // ... logic
  } catch (error) {
    logger.error("Failed to process order", { error: String(error) });
  }
}
```

### 2. Request Logging (Middleware)

The middleware (`src/proxy.ts`) automatically intercepts every request and logs it. To prevent Edge Runtime crashes or circular dependency issues, it does **not** import the database directly.

Instead, it sends a non-blocking `fetch` request to the internal logging API:

```typescript
// src/proxy.ts (Simplified)
fetch(`${origin}/api/v1/logging/request`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    requestId: uuidv4(),
    method: request.method,
    path: request.nextUrl.pathname,
    // ... metadata
  }),
});
```

### 3. Client-Side Logging

Use the `clientLogger` utility to track significant user interactions:

```typescript
import { clientLogger } from "@/lib/logger/client";

<Button onClick={() => clientLogger.logAction("add_to_cart", { productId: 1 })}>
  Add to Cart
</Button>
```

This sends an event to the server, which is then processed by the `LoggerService`.

## Database Schema (`server_logs`)

The `server_logs` table stores persistent records of server activity:

| Column       | Type    | Description                                  |
| :----------- | :------ | :------------------------------------------- |
| `id`         | Serial  | Primary Key                                  |
| `requestId`  | Varchar | Unique trace ID for the request cycle        |
| `userId`     | Integer | ID of the authenticated user (if any)        |
| `method`     | Varchar | HTTP method (GET, POST, etc.)                |
| `path`       | Text    | Request URL path                             |
| `statusCode` | Integer | HTTP response code                           |
| `duration`   | Integer | Execution time in ms                         |
| `level`      | Varchar | Log level (info, error, warn)                |
| `message`    | Text    | Human-readable description                   |
| `metadata`   | JSONB   | Structured context (sanitized headers, body) |

## Stability Notes

To ensure stability during development (especially with Turbopack):

- **No Circular Imports**: The `server_logs` schema does NOT import `users` directly. Relations are strictly defined to avoid cycles.
- **Lazy Initialization**: The `ServiceContainer` initializes the `LoggerService` only when accessed.

## Viewing Logs

- **File Logs**: `tail -f logs/app.log`
- **Database Logs**: `npm run db:studio` -> Select `server_logs` table

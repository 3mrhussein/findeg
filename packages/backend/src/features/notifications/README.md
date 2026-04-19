# Notifications Feature

The **Notifications Feature** controls all outbound transactional communication. Rather than letting every module (like `order` or `identity`) natively handle SMTP keys, this module centralizes the message bus.

## 🎯 Core Responsibilities

- **Provider Encapsulation**: Wrapping `Resend` or `SendGrid` APIs internally so a swap requires zero downstream catalog logic changes.
- **Queue Emulation**: Tracking notification states (Pending vs Sent) to allow background retry sweeps on SMTP failure.
- **Dynamic Variable Injection**: Replacing standard template markers (e.g. `{{user_name}}`) into specific HTML email wrappers dynamically.

---

## 🏗️ Domain Entities Map

| Entity             | System Role                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Notification.ts`  | The generic database ledger tracking exactly who received a message, via what medium (Email vs SMS), and at what exact UTC timestamp. |
| `EmailTemplate.ts` | The pre-compiled TSX logic utilizing `@react-email/components` safely injected via Next.js routes.                                    |

---

## 🔐 Boundaries & Transaction Limits

- **Async Preference**: `NotificationService.dispatch()` should be structurally engineered to never block a critical path (like an Order completion) if the email fails to immediately resolve.
- **Provider Segregation**: `packages/backend` relies on strictly abstracted `INotificationProvider` interfaces so test suites (Vitest) can effortlessly substitute a mock interceptor.

---

&copy; 2026 FindEg.com

# Storefront Notifications Feature

The **Storefront Notifications Feature** binds Next.js boundary layouts to pure Client-Side global toast and alert providers.

## 🎯 Technical Responsibilities

- **Sonner Integration**: Centralizing primitive toast overlays at the root `<RootLayout>` boundary ensuring persistent visualization traversing Next.js Link navigations.
- **Action State Bubbling**: Capturing generic `<form action={fn}>` backend `ServiceResult` payloads and transforming their message properties into global toasts.

---

## 🏗️ UI Architecture

### Critical Path Integration

- **`Providers.tsx`**: Injects external Toast instances into the highest React physical tree possible without bleeding `"use client"` into structural grids.
- **Action Traversal**: Storefront actions natively return localized `{ success: boolean, i18nKey: string }` tuples which the client utilizes `next-intl` to map.

---

## 🔐 Boundaries & Constraints

- **Zero DB Access**: This storefront folder NEVER calls the backend `notifications` feature physically. That backend feature is for SMTP/SES. This feature folder strictly handles ephemeral React DOM browser toasts.

---

&copy; 2026 FindEg.com

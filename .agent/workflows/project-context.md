PROJECT CONTEXT (prepend to every agent prompt):

You are working on FindEg.com — an Egyptian education-focused e-commerce platform for stationery and school supplies.

Tech stack:

Next.js 16 (App Router), React 19, TypeScript 5.7
PostgreSQL + Drizzle ORM
Tailwind CSS 3.4 + shadcn/ui (Radix primitives)
next-intl 4.7 (EN/AR, RTL support)
jose (JWT) + bcryptjs
Clean architecture: Domain → Application → Infrastructure layers
Feature modules: src/features/\*/domain, application, infrastructure
Key conventions:

All services expose interface types (IProductService etc.)
Repository pattern — no direct DB calls from services
Server Actions for web mutations, REST API for mobile
Every admin mutation logs to audit_log table
Arabic locale uses Cairo font, full RTL layout mirror
shadcn/ui components + Lucide icons throughout
Every actionable element has an icon + tooltip
The system spec and all prior decisions are documented. Follow existing patterns in the codebase exactly.

# FindEg.com - Modern E-commerce Platform

FindEg.com is a modern, trendy e-commerce web application specializing in stationary, kids' toys, and school supplies. Built with Next.js 16, clean architecture principles, and a focus on great UI/UX.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker** (for database)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd 27-10-2025ecommerceV2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   # Start PostgreSQL in Docker
   npm run db:start

   # Push database schema
   npm run db:push

   # (Optional) Seed with sample data
   npm run db:seed
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Database Setup

This project uses **Docker** to run a PostgreSQL database for development, making it easy to get started without installing PostgreSQL locally.

### Database Scripts

| Script                 | Command               | Description                                                  |
| ---------------------- | --------------------- | ------------------------------------------------------------ |
| **Start Database**     | `npm run db:start`    | Starts the PostgreSQL container and waits for it to be ready |
| **Stop Database**      | `npm run db:stop`     | Stops the PostgreSQL container                               |
| **Reset Database**     | `npm run db:reset`    | ⚠️ **Deletes all data** and creates a fresh database         |
| **View Logs**          | `npm run db:logs`     | Shows database container logs (useful for debugging)         |
| **Push Schema**        | `npm run db:push`     | Pushes your Drizzle schema to the database                   |
| **Generate Migration** | `npm run db:generate` | Generates migration files from schema changes                |
| **Run Migrations**     | `npm run db:migrate`  | Runs pending database migrations                             |
| **Open Studio**        | `npm run db:studio`   | Opens Drizzle Studio to browse/edit database                 |
| **Seed Database**      | `npm run db:seed`     | Populates database with sample data                          |

### Why Use These Scripts?

- **`db:start`** - Your first step! Starts PostgreSQL in Docker so your app can connect to a database
- **`db:push`** - After starting the database, this creates all your tables based on your schema
- **`db:seed`** - Adds sample products, categories, and users so you can test the app immediately
- **`db:stop`** - Stops the database when you're done (saves system resources)
- **`db:reset`** - Use when you want to start fresh or if your database gets into a bad state
- **`db:logs`** - Check if database is having issues or to see query logs
- **`db:studio`** - Visual interface to see and edit your data (like phpMyAdmin for PostgreSQL)

### Database Connection Details

- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `findeg_dev`
- **User:** `findeg_user`
- **Password:** `findeg_dev_password`
- **Connection String:** `postgresql://findeg_user:findeg_dev_password@localhost:5432/findeg_dev`

> **Note:** These credentials are already configured in `.env.local`. The database URL is automatically set when you run `npm run db:start`.

### Troubleshooting Database Issues

**Port 5432 already in use?**

```bash
# Option 1: Stop your local PostgreSQL
brew services stop postgresql

# Option 2: Change port in docker-compose.yml
# Change "5432:5432" to "5433:5432" and update .env.local
```

**Database won't start?**

```bash
# Check if Docker is running
docker info

# View container status
docker-compose ps

# Check logs for errors
npm run db:logs
```

**Need to access database directly?**

```bash
docker-compose exec postgres psql -U findeg_user -d findeg_dev
```

For more details, see [docs/database/SETUP.md](docs/database/SETUP.md)

---

## 🏗️ Architecture

FindEg follows **Clean Architecture** principles, ensuring that business logic is isolated from technical details like the database or UI framework.

```mermaid
graph TD
    subgraph "Framework Layer (app/)"
        NextJS["Next.js Routes"]
        Layouts["Global Layouts"]
    end

    subgraph "Presentation Layer"
        Templates["Templates (Server)"]
        Features["Features (Mixed)"]
        SharedUI["Shared UI Components"]
    end

    subgraph "Application Layer"
        Services["Business Services"]
        RepoInt["Repository Interfaces"]
    end

    subgraph "Domain Layer (Core)"
        Entities["Business Entities"]
        DomainLogic["Domain Types"]
    end

    subgraph "Infrastructure Layer"
        Drizzle["Drizzle ORM"]
        DB["PostgreSQL"]
        RepoImpl["Repository Implementations"]
    end

    Framework --> Presentation
    Presentation --> Application
    Application --> Domain
    Infrastructure -.-> RepoInt
    Application --> RepoInt
```

### Layer Responsibilities

- **Domain**: Pure business logic and entities. Zero dependencies.
- **Application**: Use cases and service orchestration.
- **Infrastructure**: Database implementation and external services.
- **Presentation**: UI components (Server/Client) and user interaction.

---

## Project Structure

### Current Structure (Feature-Based with Core)

```
src/features/
├── core/              # Shared: auth, persistence, storage, layout
├── catalog/           # Products, categories, brands
├── cart/              # Shopping cart
├── order/             # Checkout, orders
├── identity/          # Users, auth service
├── administration/    # Admin CRUD, audit, dashboard
├── review/            # Product reviews
└── media/             # File upload, storage
```

```
src/
├── app/[locale]/      # Next.js App Router routes
├── components/        # Shared UI primitives + reusable view components
├── hooks/             # Cross-feature React hooks
├── providers/         # App-level providers
├── lib/               # Utilities
└── server/            # Service composition / entry utilities
```

**Organization Principles:**

- **Features:** Each feature has `domain/`, `application/`, `infrastructure/`, `ui/`.
- **Core:** Shared cross-cutting concerns (auth, DB, layout). shadcn primitives stay at `src/components/ui/`.
- **Reusability:** Shared code in core; features depend on core.
- **Readability:** All catalog-related code lives in `features/catalog/`.

---

## 🎨 Styling & Theming

- **Tailwind CSS:** Utility-first CSS framework
- **CSS Variables:** Theme colors defined in `app/globals.css`
- **Dark Mode:** Automatic theme switching support
- **`cn` Utility:** Helper function in `lib/utils.ts` for conditional classes

**Example:**

```tsx
<div className={cn(
  "bg-primary text-white",
  isActive && "font-bold"
)}>
```

---

## 🌍 Internationalization (i18n)

- **Supported Languages:** English (`en`), Arabic (`ar`)
- **RTL Support:** Automatic right-to-left layout for Arabic via `html[lang="ar"]`
- **Single Source of Truth:** All translations live in `src/i18n/content.ts`
- **Type-Safety:** Automatically generated UPPERCASE constants for Intellisense support

**Usage:**

```tsx
import { useTranslations } from "next-intl";
import { T } from "@/i18n/content";

const t = useTranslations();
<h1>{t(T.PAGES.HOME.HERO.TITLE_PART1)}</h1>;
```

---

## 🛠️ Development Scripts

| Script          | Command         | Description                                     |
| --------------- | --------------- | ----------------------------------------------- |
| **Development** | `npm run dev`   | Start dev server (auto-kills port 3000 if busy) |
| **Build**       | `npm run build` | Create production build                         |
| **Start**       | `npm run start` | Run production server                           |
| **Lint**        | `npm run lint`  | Run ESLint                                      |

---

## 📚 Documentation Map

### 📋 Project Status

- **[Project Status](PROJECT_STATUS.md)** — Current MVP progress, completed foundations, and active backlog.

### 📋 System Specification

- **[System Specification](project-planning/SYSTEM_SPECIFICATION.md)** — Complete business & technical spec with diagrams: vision, actors, user flows, architecture, database schema, API, features, roadmap, and NFRs.
- **Dual-Track Goal (B2C + B2B2C)** — Defined in the System Specification section `Current Business Goal (Dual Track)` and reflected in [Project Status](PROJECT_STATUS.md) success criteria.

### Architecture

- **[Architecture Playbook](docs/architecture/ARCHITECTURE_PLAYBOOK.md)** — Consolidated source of truth for context map, feature structure, dependency boundaries, layer contracts, and implementation workflow.
- **[Bounded Contexts](docs/architecture/BOUNDED_CONTEXTS.md)** — Pointer to merged context map in the Architecture Playbook.
- **[Feature Structure](docs/architecture/FEATURE_STRUCTURE.md)** — Pointer to merged structure conventions in the Architecture Playbook.

### 🧩 Feature Docs

- **[Core](src/features/core/README.md)** — Shared auth/session, persistence, and cross-cutting platform concerns.
- **[Catalog](src/features/catalog/README.md)** — Categories, brands, products, variants, and pricing foundations.
- **[Cart](src/features/cart/README.md)** — Cart behavior, pricing snapshots, and cart APIs.
- **[Order](src/features/order/README.md)** — Checkout, order creation, and order snapshots.
- **[Identity](src/features/identity/README.md)** — User and auth domain/application flows.
- **[Administration](src/features/administration/README.md)** — Admin operations, inventory, and audit logging.
- **[Review](src/features/review/README.md)** — Product review workflows.
- **[Media](src/features/media/README.md)** — Asset upload and media storage concerns.
- **[Presentation Layer](src/components/README.md)** — Components, hooks, providers, and co-location strategy.
- **[App Layer (Routing)](src/app/README.md)** — Next.js App Router, layouts, and data fetching patterns.

### 📖 Guides

- **[Development Guide](docs/guides/DEVELOPMENT.md)** - Step-by-step feature implementation & setup.
- **[Implementation Standards](docs/guides/IMPLEMENTATION_STANDARDS.md)** - Clean architecture implementation checklist and layer-specific coding standards.
- **[Scaling Standards](docs/guides/SCALING.md)** - How to grow the codebase maintainably.
- **[Static Content Guide](docs/guides/STATIC_CONTENT.md)** - Managing page-scoped UI text and i18n.
- **[Logging Guide](docs/guides/LOGGING.md)** - Understanding the multi-tiered logging architecture.
- **[Onboarding](docs/onboarding/README.md)** - Getting started for new developers.
- **[Auth Architecture](docs/AUTH_ARCHITECTURE.md)** - Decentralized session management & Phase 2 roadmap.

### 📊 Database & Translations

- **[Database Setup](docs/database/SETUP.md)** - Local and production DB management.
- **[Database Schema](docs/database/SCHEMA.md)** - Auto-generated ER diagram and table definitions.
- **[Translation Strategy](docs/translations/README.md)** - Static vs Dynamic translation patterns.

---

## 🔑 Key Features

### E-commerce Functionality

- Product browsing with categories
- Advanced filtering and search
- Shopping cart with variants
- Product reviews and ratings
- Wishlist management
- Checkout process

### Technical Features

- **Server-Side Rendering (SSR)** - Fast initial page loads
- **Static Site Generation (SSG)** - Pre-rendered pages
- **Image Optimization** - Automatic image optimization
- **Code Splitting** - Optimized bundle sizes
- **TypeScript** - Full type safety
- **Clean Architecture** - Maintainable and testable code
- **Advanced Logging** - Multi-tiered (File/DB) logging with async middleware integration

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 📝 Contributing

1. **Follow Atomic Design** - Place components in correct folders
2. **Server Components First** - Only use Client Components when needed
3. **Type Everything** - Define interfaces for all props
4. **Use Constants** - Store mock data in `lib/constants.ts`
5. **Extract Logic** - Create hooks for reusable logic

---

## ❓ FAQ

**Q: Why `npm run dev` instead of `next dev`?**  
A: Our custom script (`scripts/dev.js`) automatically kills any process using port 3000 before starting the server.

**Q: Where is the actual page code?**
A: Page logic is now co-located in `src/app/[locale]/.../page.tsx` and its sibling component files.

**Q: How do I add a new page?**
A: Create a folder in `src/app/[locale]/` with a `page.tsx`. You can build components right there in the same folder.

**Q: Database not connecting?**  
A: Make sure you've run `npm run db:start` and that Docker is running. Check `.env.local` has the correct `DATABASE_URL`.

**Q: How do I change colors?**  
A: Edit CSS variables in `app/globals.css` or update `tailwind.config.js`.

**Q: What's the difference between Server and Client components?**  
A: Server Components render on the server (no `'use client'`), Client Components run in the browser (have `'use client'` directive).

---

## 📄 License

This project is private and proprietary.

---

## 👥 Team

**FindEg Team** - Building the future of e-commerce in Egypt 🇪🇬
